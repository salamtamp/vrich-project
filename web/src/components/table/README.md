# Table Component Manual

## Basic Usage

```tsx
import Table, { TableColumn } from '@/components/table';

type User = { id: string; name: string; age: number; email: string };

// Responsive: columns share space equally if width is not set
const columns: TableColumn<User>[] = [
  { key: 'name', label: 'Name' },
  { key: 'age', label: 'Age' },
  { key: 'email', label: 'Email' },
];

const data: User[] = [
  { id: '1', name: 'Alice', age: 30, email: 'alice@test.com' },
  { id: '2', name: 'Bob', age: 25, email: 'bob@test.com' },
];

<Table columns={columns} data={data} />
```

## Proportional/Percent Widths

```tsx
const columns: TableColumn<User>[] = [
  { key: 'name', label: 'Name', width: '40%' },
  { key: 'age', label: 'Age', width: '20%' },
  { key: 'email', label: 'Email', width: '40%' },
];
```

- If you set `width` as a percent string (e.g., '20%'), columns will take that proportion of the table width.
- If you do not set `width`, columns will share space equally and be fully responsive.
- Avoid using fixed pixel widths for best responsiveness.

## Custom Cell Render

```tsx
const columns: TableColumn<User>[] = [
  { key: 'name', label: 'Name', render: (row) => <span className='text-primary'>{row.name}</span> },
  { key: 'age', label: 'Age', render: (row) => (row.age > 18 ? 'Adult' : 'Minor') },
  { key: 'email', label: 'Email' },
];
```

## Sorting

```tsx
const [sortBy, setSortBy] = useState<string>('name');
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

const handleSort = (columnId: string) => {
  if (sortBy === columnId) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  else {
    setSortBy(columnId);
    setSortOrder('asc');
  }
};

const columns: TableColumn<User>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'age', label: 'Age', sortable: true },
  { key: 'email', label: 'Email' },
];

<Table
  columns={columns}
  data={data}
  sortBy={sortBy}
  sortOrder={sortOrder}
  onSort={handleSort}
/>;
```

## Loading State

```tsx
<Table
  columns={columns}
  data={[]}
  isLoading
/>
```

## Empty State

```tsx
<Table
  columns={columns}
  data={[]}
  emptyStateComponent={<div>No users found</div>}
/>
```

## Row Click

```tsx
<Table
  columns={columns}
  data={data}
  onClickRow={(e, row) => alert(row.name)}
/>
```

## Row Props

```tsx
<Table
  columns={columns}
  data={data}
  bodyRowProps={{ 'data-testid': 'user-row' }}
/>
```

## Responsive/Sticky Header

Table is horizontally scrollable and header is always visible.

## Type-First

All types are generic and type-safe. See `TableColumn<T>` and `TableProps<T>`.

## v2.0.0+ Changes

- All generics must extend `Record<string, unknown>` for type safety (no `any` or type assertions).
- Uses `tailwind-merge` for all dynamic className merging.
- Follows project rules for typing, styling, and icon usage.

## Column Widths

- All columns must now specify a `width` property (string or number). This ensures header and body cells are always aligned and the table layout is predictable.
- Example:

```tsx
const columns: TableColumn<User>[] = [
  { key: 'name', label: 'Name', width: 200 },
  { key: 'age', label: 'Age', width: 100 },
  { key: 'email', label: 'Email', width: 250 },
];
```
