import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const CONTAINER_CLASS = "w-full px-4 sm:px-8 lg:px-16 xl:px-24 2xl:px-32";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}