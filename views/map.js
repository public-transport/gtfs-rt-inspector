import {Component, createRef, h} from 'preact'
import mapboxgl from 'mapbox-gl'

const MAPBOX_GL_CSS_URL = '/mapbox-gl.css'

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

	updateMap() {
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
					// todo: vehicle.(id, label, license_place), trip.(id, route_id, st_date, st_time)
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
		this.map.fitBounds(bounds, {padding: 20})
	}

	componentDidMount() {
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
