/**
 * Slideout content registry
 *
 * Stores React elements (title, content) outside Redux since they aren't
 * serializable. The Redux store tracks open/close state; this registry
 * holds the renderable content for each slideout ID.
 *
 * @package WPAppointments
 * @since 0.4.0
 */
import type { ReactNode } from 'react';

export type SlideoutContent = {
	title?: string;
	content?: ReactNode;
};

const contentRegistry = new Map<string, SlideoutContent>();

export function setSlideoutContent(id: string, entry: SlideoutContent): void {
	contentRegistry.set(id, entry);
}

export function getSlideoutContent(id: string): SlideoutContent | undefined {
	return contentRegistry.get(id);
}

export function removeSlideoutContent(id: string): void {
	contentRegistry.delete(id);
}
