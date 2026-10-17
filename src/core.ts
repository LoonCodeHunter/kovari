export const VERSION="0.1.0"as const;export type Json=string|number|boolean|null|Json[]|{[key:string]:Json};export const createId=(prefix="id")=>`${prefix}_${crypto.randomUUID()}`;
