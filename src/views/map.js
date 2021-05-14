import mapboxgl from 'maplibre-gl'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks'
import { humanDelay } from '../lib/time';

import "maplibre-gl/dist/maplibre-gl.css"

// https://docs.mapbox.com/mapbox-gl-js/api/properties/#prewarm
setTimeout(() => {
	mapboxgl.prewarm()
}, 100)


function getMapBounds (feedData) {
	const entities = feedData.entity || []
	const positions = entities.filter(e => e.vehicle && e.vehicle.position)

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
	return bounds
}

function updateMap (map, feedData) {
	const entities = feedData.entity || []
	const positions = entities.filter(e => e.vehicle && e.vehicle.position)

	if (positions.length === 0) {
		// todo: remove data source from existing map
		return;
	}

	const src = map.getSource('vehicle-positions')
	if (!src) return;
	src.setData({
		type: 'FeatureCollection',
		features: positions.map(({ vehicle, id }) => ({
			type: 'Feature',
			id,
			properties: {
				gtfs: {
					vehicle: {
						id: vehicle.vehicle.id,
						label: vehicle.vehicle.label,
						licensePlate: vehicle.vehicle.licensePlate,
					},
					trip: {
						id: vehicle.trip.tripId,
						routeId: vehicle.trip.routeId,
						startDate: vehicle.trip.startDate,
						startTime: vehicle.trip.startTime,
					},
					delay: vehicle.delay,
				},
			},
			geometry: {
				type: 'Point',
				coordinates: [
					vehicle.position.longitude,
					vehicle.position.latitude,
				],
			},
		})),
	})
}

function createMap (el, mapState, setMapState, isDefaultMapState, feedData, setPopup) {
	const map = new mapboxgl.Map({
		container: el,
		style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json', // stylesheet location
		center: [mapState.mapLng, mapState.mapLat], // starting position [lng, lat]
		zoom: mapState.mapZoom // starting zoom
	})

	map.once('load', () => {
		map.addSource('vehicle-positions', {
			type: 'geojson',
			data: { type: 'FeatureCollection', features: [] },
		})
		map.addLayer({
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

		let hoveredStateId = null

		function enter (e) {
			if (hoveredStateId != null) {
				map.setFeatureState(
					{ source: 'vehicle-positions', id: hoveredStateId },
					{ hover: false }
				);
			}
			const data = e.features.find(f => f.source === 'vehicle-positions')
			if (!data) return;
			hoveredStateId = data.id
			map.setFeatureState(
				{ source: 'vehicle-positions', id: hoveredStateId },
				{ hover: true }
			);
			map.getCanvas().style.cursor = 'pointer'
			setPopup({
				pos: {
					x: e.point.x,
					y: e.point.y,
				},
				data: JSON.parse(data.properties.gtfs),
			})
		}
		function leave (e) {
			map.setFeatureState(
				{ source: 'vehicle-positions', id: hoveredStateId },
				{ hover: false }
			);
			hoveredStateId = null
			map.getCanvas().style.cursor = ''
			setPopup(null)
		}

		map.on('mousemove', 'vehicle-positions', enter)
		map.on('mouseleave', 'vehicle-positions', leave)

		updateMap(map, feedData)

		const bounds = getMapBounds(feedData)
		let boundsCenter = bounds.getCenter()
		let mapCenter = map.getCenter()

		const distance = boundsCenter.distanceTo(mapCenter)
		// 100km
		const maxDistanceMeters = 100 * 1000;

		if (isDefaultMapState || distance > maxDistanceMeters) {
			map.fitBounds(bounds, { padding: 50, animate: false })
		}
	})

	map.on('moveend', () => {
		const center = map.getCenter()
		setMapState({
			mapZoom: map.getZoom(),
			mapLng: center.lng,
			mapLat: center.lat,
		})
	})

	window.map = map;

	return map
}

export function Map ({ state, emit }) {
	const { mapZoom, mapLng, mapLat } = state;

	const ref = useRef()
	const map = useRef()

	const [popup, setPopup] = useState(null)

	const setMapState = useCallback((mapState) => {
		emit('map-state:set', mapState)
	}, [emit])

	useLayoutEffect(() => {
		const isDefaultMapState = mapZoom === 5;
		const newMap = createMap(
			ref.current,
			{ mapZoom, mapLng, mapLat },
			setMapState,
			isDefaultMapState,
			state.feedData,
			setPopup
		)
		map.current = newMap
		return () => {
			newMap.remove()
		}
	}, []);

	useEffect(() => {
		if (!map.current) return;
		updateMap(map.current, state.feedData);
	}, [map.current, state.feedData]);

	return (
		<div class="map" ref={ref}>
			{popup && <MapPopup popup={popup}/>}
		</div>
	)
}

function MapPopup ({ popup }) {
	return (
		<div className="popup" style={`color: black;transform: translate(${popup.pos.x + 5}px, ${popup.pos.y + 5}px);`}>
			<h3>{popup.data.vehicle.label}</h3>
			<dl>
				<div>
					<dt>Delay</dt>
					<dd>{humanDelay(popup.data.delay)}</dd>
				</div>
				<div>
					{popup.data.vehicle.id && (<>
						<dt>Vehicle ID</dt>
						<dd>{popup.data.vehicle.id}</dd>
					</>)}
					<dt>Vehicle Label</dt>
					<dd>{popup.data.vehicle.label}</dd>
					{popup.data.vehicle.licensePlate && (<>
						<dt>Vehicle License Plate</dt>
						<dd>{popup.data.vehicle.licensePlate}</dd>
					</>)}
				</div>
				<div>
					<dt>Trip ID</dt>
					<dd>{popup.data.trip.id}</dd>
					<dt>Route ID</dt>
					<dd>{popup.data.trip.routeId}</dd>
					<dt>Start Date</dt>
					<dd>{popup.data.trip.startDate}</dd>
					<dt>Start Time</dt>
					<dd>{popup.data.trip.startTime}</dd>
				</div>
			</dl>
		</div>
	)
}
