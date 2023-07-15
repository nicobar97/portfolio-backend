import crypto from "node:crypto";
import path from "node:path";
import fs from "fs";

export const groupBy = <T>(
  array: T[],
  predicate: (value: T, index: number, array: T[]) => string
) =>
  array.reduce((acc, value, index, array) => {
    (acc[predicate(value, index, array)] ||= []).push(value);
    return acc;
  }, {} as { [key: string]: T[] });

export const randomUUID = (): string => crypto.randomUUID().replace(/-/g, "");
export const formatDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Rome",
  };

  return date.toLocaleString("it-IT", options);
};

export const formatMonth = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    timeZone: "Europe/Rome",
  };

  const monthFormatter = new Intl.DateTimeFormat("it-IT", options);
  const italianMonth = monthFormatter.format(date);
  return capitalizeFirstLetter(italianMonth);
};

export const formatDateYYYYMMDD = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Europe/Rome",
  };

  const formattedDate = date.toLocaleDateString("it-IT", options);
  const [day, month, year] = formattedDate.split("/");
  return `${year}${month}${day}`;
};

export const formatDateMMYYYY = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    timeZone: "Europe/Rome",
  };

  const formattedDate = date.toLocaleDateString("it-IT", options);
  const [month, year] = formattedDate.split("/");
  return `${month}.${year}`;
};

export const formatDateItalianMonth = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    year: "numeric",
    timeZone: "Europe/Rome",
  };
  const formattedDate = date.toLocaleDateString("it-IT", options);
  return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
};

export const formatDateDDMMYYYY = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Europe/Rome",
  };

  const formattedDate = date.toLocaleDateString("it-IT", options);
  const [day, month, year] = formattedDate.split("/");
  return `${day}/${month}/${year}`;
};

export const capitalizeFirstLetter = (input: string) =>
  input.charAt(0).toUpperCase() + input.slice(1);

export const getProjectRoot = () => {
  const rootFile = require.main.filename;
  const rootDir = path.dirname(rootFile);
  return rootDir;
};

export const createDirIfNotExists = (folderPath: string) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};
