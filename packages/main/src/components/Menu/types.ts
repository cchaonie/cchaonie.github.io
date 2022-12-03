export interface Link {
  name: string;
  link?: string;
  subLinks?: Link[];
}
export interface MenuProps {
  links: Link[];
}
