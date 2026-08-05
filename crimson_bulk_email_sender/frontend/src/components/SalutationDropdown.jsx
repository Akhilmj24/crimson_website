import React from 'react';
import Dropdown from './Dropdown';

const SALUTATIONS = ['Mr.', 'Mrs.', 'Ms.', 'Miss', 'Dr.', 'Prof.'];

export default function SalutationDropdown({ value, onChange, disabled, style, selectStyle, error }) {
  const options = SALUTATIONS.map(s => ({ value: s, label: s }));
  return (
    <Dropdown
      placeholder="Salutation"
      options={options}
      value={value}
      onChange={onChange}
      disabled={disabled}
      searchable={false}
      clearable={true}
      style={style}
      selectStyle={{ height: '36px', ...selectStyle }}
      error={error}
    />
  );
}
