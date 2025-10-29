import { useState, forwardRef } from 'react';
import PhoneNumberInput from 'react-phone-number-input/input';
import 'react-phone-number-input/style.css';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { getCountryCode } from './utils';
import { CountryListPopover } from './list';

// ----------------------------------------------------------------------

export const PhoneInput = forwardRef(
  ({ value, onChange, placeholder, country: inputCountryCode, disableSelect, ...other }, ref) => {
    const defaultCountryCode = getCountryCode(value, inputCountryCode);

    const [selectedCountry, setSelectedCountry] = useState(defaultCountryCode);

    const handleCountryChange = (newCountryCode) => {
      setSelectedCountry(newCountryCode);
    };

    return (
      <PhoneNumberInput
        ref={ref}
        country={selectedCountry}
        inputComponent={CustomInput}
        value={value}
        onChange={onChange}
        placeholder={placeholder ?? 'Enter phone number'}
        InputProps={
          disableSelect
            ? undefined
            : {
                startAdornment: (
                  <InputAdornment position="start" sx={{ ml: 1 }}>
                    <CountryListPopover
                      countryCode={selectedCountry}
                      onClickCountry={handleCountryChange}
                    />
                  </InputAdornment>
                ),
              }
        }
        {...other}
      />
    );
  }
);

// ----------------------------------------------------------------------

const CustomInput = forwardRef((props, ref) => <TextField inputRef={ref} {...props} />);
