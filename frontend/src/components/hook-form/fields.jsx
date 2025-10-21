import { RHFSelect } from './rhf-select';
import { RHFEditor } from './rhf-editor';
import { RHFSwitch } from './rhf-switch';
import { RHFTextField } from './rhf-text-field';
import { RHFRadioGroup } from './rhf-radio-group';
import { RHFPhoneInput } from './rhf-phone-input';
import { RHFAutocomplete } from './rhf-autocomplete';
import { RHFCountrySelect } from './rhf-country-select';
import { RHFCheckbox, RHFMultiCheckbox } from './rhf-checkbox';
import { RHFUpload, RHFUploadAvatar } from './rhf-upload-cloudinary';

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
