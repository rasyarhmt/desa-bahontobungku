import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const CONTAINER_CLASS = "w-full px-4 sm:px-8 lg:px-16 xl:px-24 2xl:px-32";

export const SECTION_CLASS = "py-16 md:py-24";
export const INNER_BREADCRUMB_CLASS = "mb-4 md:mb-6";
export const INNER_SECTION_CLASS = "py-8 md:py-10";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}