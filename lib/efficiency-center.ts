// lib/efficiency-center.ts
//
// Fetches all four dynamic sections (Spaces, Events, Partners, Testimonials)
// from Strapi (site slug "efficiency-center") and shapes them into the same
// types the existing components already expect.

import { fetchAPI, getStrapiURL } from './strapi'
import type { Unit } from './units'

export type UnitWithShape = Unit & { shape: 'square' | 'tall' }
import type { EventCard } from './events'
import type { Testimonial, SilhouetteVariant } from './testimonials'

const SITE_SLUG = 'efficiency-center'

const SPACES_COMPONENT = 'ec.spaces-grid'
const EVENTS_COMPONENT = 'ec.events-grid'
const CLIENTS_COMPONENT = 'ec.clients-grid'
const REVIEWS_COMPONENT = 'ec.reviews-grid'

export type PartnerLogoItem = {
	name: string
	logo: string
}

async function getAllSections(): Promise<any[]> {
	let site
	try {
		site = await fetchAPI(`/api/site-full?slug=${SITE_SLUG}`)
	} catch (err) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Failed to fetch Efficiency Center site from Strapi:', err)
		}
		return []
	}

	if (!site || !site.pages || !site.pages.length) return []

	const sections: any[] = []
	for (const page of site.pages) {
		for (const section of page.sections || []) {
			sections.push(section)
		}
	}
	return sections
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '')
}

function resolveMediaUrl(url: string): string {
	if (!url) return ''
	if (url.startsWith('http://') || url.startsWith('https://')) return url
	return getStrapiURL(url)
}

function hashString(value: string): number {
	let h = 0
	for (let i = 0; i < value.length; i += 1) {
		h = (h << 5) - h + value.charCodeAt(i)
		h |= 0
	}
	return Math.abs(h)
}

export async function getUnits(): Promise<UnitWithShape[]> {
	const sections = await getAllSections()
	const grid = sections.find((s) => s.__component === SPACES_COMPONENT)
	if (!grid || !grid.spaces) return []

	return grid.spaces.map((space: any, index: number) => ({
		slug: slugify(space.title_en || `space-${index}`),
		title: space.title_en || '',
		detail: space.description_en || '',
		image: space.image ? resolveMediaUrl(space.image.url) : '',
		shape: space.shape === 'square' ? 'square' : 'tall',
	}))
}

export async function getEvents(): Promise<EventCard[]> {
	const sections = await getAllSections()
	const grid = sections.find((s) => s.__component === EVENTS_COMPONENT)
	if (!grid || !grid.events) return []

	return grid.events.map((event: any) => {
		const media = event.media
		const isVideo = media && media.mime && media.mime.startsWith('video')
		return {
			id: slugify(event.title_en || `event-${event.id}`),
			title: event.title_en || '',
			description: event.description_en || '',
			image: !isVideo && media ? resolveMediaUrl(media.url) : '',
			video: isVideo && media ? resolveMediaUrl(media.url) : undefined,
		}
	})
}

export async function getPartnerLogos(): Promise<PartnerLogoItem[]> {
	const sections = await getAllSections()
	const grid = sections.find((s) => s.__component === CLIENTS_COMPONENT)
	if (!grid || !grid.clients) return []

	return grid.clients.map((client: any) => ({
		name: client.name || '',
		logo: client.logo ? resolveMediaUrl(client.logo.url) : '',
	}))
}

export async function getTestimonials(): Promise<Testimonial[]> {
	const sections = await getAllSections()
	const grid = sections.find((s) => s.__component === REVIEWS_COMPONENT)
	if (!grid || !grid.reviews) return []

	return grid.reviews.map((review: any) => {
		// reviewer_name is stored as a single "Name, Role" string in Strapi.
		const raw: string = review.reviewer_name || ''
		const commaIndex = raw.indexOf(',')
		const name = (commaIndex === -1 ? raw : raw.slice(0, commaIndex)).trim()
		const role = (commaIndex === -1 ? 'Google review' : raw.slice(commaIndex + 1)).trim()

		const silhouette: SilhouetteVariant = hashString(name) % 2 === 0 ? 'male' : 'female'

		return {
			id: `review-${review.id}`,
			quote: review.quote_en || '',
			name,
			role,
			rating: 5,
			silhouette,
		}
	})
}