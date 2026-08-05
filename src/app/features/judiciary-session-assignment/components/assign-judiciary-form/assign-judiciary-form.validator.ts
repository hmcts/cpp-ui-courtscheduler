import { AbstractControl, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { ErrorMessageConfig } from '@cpp/pdk';
import { JudiciarySelectionFormGroup } from '../../../../shared';

export const judgeRecorderConflictValidator =
  (formGroup: FormGroup<JudiciarySelectionFormGroup>): ValidatorFn =>
  (control: AbstractControl): ValidationErrors | null => {
    const selectedTypes: (keyof JudiciarySelectionFormGroup)[] = Array.isArray(control.value)
      ? control.value
      : [];
    if (selectedTypes.includes('Judge') && selectedTypes.includes('Recorder')) {
      const judgeHasValue = formGroup.controls.Judge?.value != null;
      const recorderHasValue = formGroup.controls.Recorder?.value != null;
      if (judgeHasValue && recorderHasValue) {
        return { judgeRecorderConflict: true };
      }
    }
    return null;
  };

export const judgeRecorderConflictErrorMessages: ErrorMessageConfig[] = [
  {
    rule: 'judgeRecorderConflict',
    message: 'You cannot add a Judge and a Recorder to the same session.'
  }
];
