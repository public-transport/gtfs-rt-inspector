import {Component, createRef, h} from 'preact'
import mapboxgl from 'mapbox-gl'

const MAPBOX_GL_CSS_URL = '/mapbox-gl.css'

// Mapbox GL JS currently doesn't support SVG icons
const TRIP_SHAPE_ARROW_URL = '/arrow.png'
// const TRIP_SHAPE_ARROW_URL = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100px' height='100px'%3E%3Cpath d='M10 15 L15 10 L70 50 L15 90 L10 85 L35 50 z' fill='%23e0e0e0' stroke='%23e0e0e0' stroke-width='10px' stroke-linejoin='round' /%3E%3C/svg%3E`

const FOCUSED_TRIP_SHAPE_OPACITY = {
	base: .3,
	stops: [[9, .3], [15, .8]],
}

mapboxgl.accessToken = process.env.MAPBOX_TOKEN
// https://docs.mapbox.com/mapbox-gl-js/api/properties/#prewarm
setTimeout(() => {
	mapboxgl.prewarm()
}, 100)

const putMapboxGLCss = () => {
	const sheets = Array.from(document.head.querySelectorAll('link[rel="stylesheet"]'))
	if (sheets.find(s => s.getAttribute('href') === MAPBOX_GL_CSS_URL)) return;

	console.debug('dynamically inserting Mapbox GL CSS <link>')
	const sheet = document.createElement('link')
	sheet.setAttribute('rel', 'stylesheet')
	sheet.setAttribute('href', MAPBOX_GL_CSS_URL)
	document.head.appendChild(sheet)
}

// todo: sync map zoom & position with state
class MapView extends Component {
	constructor() {
		super()
		this.ref = createRef()
	}

	updateVehiclePositions() {
		const {feedData} = this.props.state
		const entities = feedData.entity || []
		const positions = entities.filter(e => e.vehicle && e.vehicle.position)

		if (positions.length === 0) {
			// todo: remove data source from existing map
			return;
		}

		const src = this.map.getSource('vehicle-positions')
		src.setData({
			type: 'FeatureCollection',
			features: positions.map(entity => ({
				type: 'Feature',
				properties: {
					trip_id: entity.vehicle.trip?.trip_id,
					// todo: vehicle.(id, label, license_place), trip.(route_id, st_date, st_time)
					// This is not standard GTFS-RT, but added by
					// lib/add-tripupdate-delays-to-vehiclepositions.
					delay: entity.vehicle.delay,
				},
				geometry: {
					type: 'Point',
					coordinates: [
						entity.vehicle.position.longitude,
						entity.vehicle.position.latitude,
					],
				},
			})),
		})

		// fit map viewbox to data
		const crd0 = [
			positions[0].vehicle.position.longitude,
			positions[0].vehicle.position.latitude,
		]
		const bounds = new mapboxgl.LngLatBounds(crd0, crd0)
		for (const pos of positions) {
			bounds.extend([
				pos.vehicle.position.longitude,
				pos.vehicle.position.latitude,
			])
		}
		this.map.fitBounds(bounds, {padding: 50})
	}

	updateFocusedTripShape() {
		const {focusedTripShape} = this.props.state
		const src = this.map.getSource('focused-trip-shape')

		if (focusedTripShape === null) {
			src.setData({type: 'FeatureCollection', features: []})
		} else {
			src.setData(focusedTripShape)
		}
	}

	updateMap() {
		this.updateVehiclePositions()
		this.updateFocusedTripShape()
	}

	componentDidMount() {
		const {emit} = this.props

		putMapboxGLCss()

		this.map = new mapboxgl.Map({
			container: this.ref.current,
			// todo
			style: 'mapbox://styles/mapbox/dark-v10', // stylesheet location
			center: [-74.5, 40], // starting position [lng, lat]
			zoom: 9 // starting zoom
		})

		this.map.once('load', () => {
			this.map.addSource('vehicle-positions', {
				type: 'geojson',
				data: {type: 'FeatureCollection', features: []},
			})
			this.map.addLayer({
				id: 'vehicle-positions',
				source: 'vehicle-positions',
				type: 'circle',
				paint: {
					'circle-radius': {
						base: 1.5,
						stops: [[1, 1], [20, 35]],
					},
					'circle-color': [
						'case',
						// todo: highlight if trip_id === state.focusedTripId
						['!=', ['get', 'delay'], null],
						[
							'interpolate',
							['linear'],
							['get', 'delay'],
							0, ['to-color', '#2ecc71'],
							90, ['to-color', '#eebb00'],
							210, ['to-color', '#ee2200'],
						],
						'#e0e0e0', // todo: pick better color?
					],
				},
			})
			this.map.on('mouseenter', 'vehicle-positions', () => {
				this.map.getCanvas().style.cursor = 'pointer'
			})
			this.map.on('mouseleave', 'vehicle-positions', () => {
				this.map.getCanvas().style.cursor = ''
			})
			this.map.on('click', 'vehicle-positions', (e) => {
				const tripId = e.features[0]?.properties.trip_id || null
				emit('focus-trip-id', tripId)
			})

			this.map.addSource('focused-trip-shape', {
				type: 'geojson',
				data: null,
			})
			this.map.addLayer({
				id: 'focused-trip-shape',
				source: 'focused-trip-shape',
				type: 'line',
				paint: {
					'line-width': {
						base: 1,
						stops: [[1, .5], [20, 3]],
					},
					'line-color': '#e0e0e0',
					'line-opacity': FOCUSED_TRIP_SHAPE_OPACITY,
				},
			})

			// todo: instead show all active vehicles in their current orientation, according to the shape?
			const map = this.map
			map.loadImage(TRIP_SHAPE_ARROW_URL, (err, image) => {
				if (err) {
					console.error('failed to load trip shape arrow', err)
					return;
				}
				map.addImage('focused-trip-shape-arrow', image)
				map.addLayer({
					id: 'focused-trip-shape-arrows',
					type: 'symbol',
					source: 'focused-trip-shape',
					paint: {
						'icon-color': '#e0e0e0',
						'icon-opacity': FOCUSED_TRIP_SHAPE_OPACITY,
					},
					layout: {
						'symbol-placement': 'line',
						'icon-ignore-placement': true,
						'icon-image': 'focused-trip-shape-arrow',
						'icon-size': .1,
					},
				})
			})

			this.updateMap()
		})
	}
	componentDidUpdate() {
		this.updateMap()
	}
	componentWillUnmount() {
		if (this.map) {
			this.map.remove()
			this.map = null
		}
	}

	render() {
		return (
			<div class="map" ref={this.ref}>
				{/*<div ref={this.ref} />*/}
			</div>
		)
	}
}

export default MapView
