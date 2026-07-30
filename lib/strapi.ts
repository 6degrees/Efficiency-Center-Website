// lib/strapi.ts
//
// This site is statically exported to GitHub Pages, so there's no server
// at runtime — all fetching happens in the browser. That means the env
// var MUST be prefixed with NEXT_PUBLIC_ so Next.js bakes it into the
// client bundle at build time.
//
// Set it in a `.env.local` file at the project root, e.g.:
//
//   NEXT_PUBLIC_STRAPI_URL=https://api.efficiencys.com.sa

export function getStrapiURL(path = '') {
	const base = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'
	return `${base}${path}`
}

export async function fetchAPI(path: string) {
	const requestUrl = getStrapiURL(path)

	const response = await fetch(requestUrl, { cache: 'no-store' })

	if (!response.ok) {
		throw new Error(`Strapi request failed (${response.status}): ${requestUrl}`)
	}

	return response.json()
}