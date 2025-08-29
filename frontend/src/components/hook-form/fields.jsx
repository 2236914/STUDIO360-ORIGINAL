import { RHFTextField } from './rhf-text-field';
import { RHFRadioGroup } from './rhf-radio-group';
import { RHFPhoneInput } from './rhf-phone-input';
import { RHFCountrySelect } from './rhf-country-select';
import { RHFCheckbox, RHFMultiCheckbox } from './rhf-checkbox';
import { RHFAutocomplete } from './rhf-autocomplete';
import { RHFSelect } from './rhf-select';
import { RHFEditor } from './rhf-editor';
import { RHFUpload, RHFUploadAvatar } from './rhf-upload';
import { RHFSwitch } from './rhf-switch';

// ----------------------------------------------------------------------

export const Field = {
  Text: RHFTextField,
  Phone: RHFPhoneInput,
  Checkbox: RHFCheckbox,
  RadioGroup: RHFRadioGroup,
  CountrySelect: RHFCountrySelect,
  MultiCheckbox: RHFMultiCheckbox,
  Autocomplete: RHFAutocomplete,
  Select: RHFSelect,
  Editor: RHFEditor,
  Upload: RHFUpload,
  UploadAvatar: RHFUploadAvatar,
  Switch: RHFSwitch,
};
