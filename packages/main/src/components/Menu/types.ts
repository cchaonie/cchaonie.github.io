export interface Link {
  name: string;
  link?: string;
  children?: Link[];
}
export interface MenuProps {
  links: Link[];
}
