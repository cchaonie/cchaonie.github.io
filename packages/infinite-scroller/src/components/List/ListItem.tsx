import './index.css';

export default function ListItem({ item }: any) {
  return (
    <li className='listItem' data-itemname={item.name}>
      <p>{item.name}</p>
      <p>{item.description}</p>
    </li>
  );
}
