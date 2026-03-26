'use server';

import { getServices as getServicesData } from '@/lib/data/services';
import type { Service } from '@/lib/types';

/**
 * Server action to fetch all active services for the booking wizard.
 * Wraps the cached data layer function which is server-only.
 */
export async function getServicesAction(): Promise<Service[]> {
  try {
    const services = await getServicesData();
    return services;
  } catch (error) {
    console.error('Failed to fetch services in action:', error);
    return [];
  }
}
