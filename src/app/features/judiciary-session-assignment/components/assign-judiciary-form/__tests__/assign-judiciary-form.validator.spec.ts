import { FormControl, FormGroup } from '@angular/forms';
import { ExtendedJudicialMember } from '../../../../../shared';
import { JudiciarySelectionFormGroup } from '../../../../../shared';
import {
  judgeRecorderConflictErrorMessages,
  judgeRecorderConflictValidator
} from '../assign-judiciary-form.validator';

const mockMember = (id: string): ExtendedJudicialMember =>
  ({ id }) as unknown as ExtendedJudicialMember;

function buildFormGroup(
  judgeValue: ExtendedJudicialMember | null = null,
  recorderValue: ExtendedJudicialMember | null = null
): FormGroup<JudiciarySelectionFormGroup> {
  return new FormGroup({
    Judge: new FormControl<ExtendedJudicialMember | null>(judgeValue),
    Recorder: new FormControl<ExtendedJudicialMember | null>(recorderValue),
    'District Judge': new FormControl<ExtendedJudicialMember | null>(null),
    'Deputy District Judge': new FormControl<ExtendedJudicialMember | null>(null),
    Magistrate: new FormControl<ExtendedJudicialMember[] | null>(null)
  }) as unknown as FormGroup<JudiciarySelectionFormGroup>;
}

describe('judgeRecorderConflictValidator', () => {
  describe('when control value is not an array', () => {
    it('returns null', () => {
      expect.assertions(1);
      const validator = judgeRecorderConflictValidator(buildFormGroup());
      expect(validator(new FormControl(null))).toBeNull();
    });
  });

  describe('when neither Judge nor Recorder is selected', () => {
    it('returns null', () => {
      expect.assertions(1);
      const validator = judgeRecorderConflictValidator(buildFormGroup());
      expect(validator(new FormControl([]))).toBeNull();
    });
  });

  describe('when only Judge is selected', () => {
    it('returns null regardless of formGroup value', () => {
      expect.assertions(1);
      const validator = judgeRecorderConflictValidator(buildFormGroup(mockMember('j1')));
      expect(validator(new FormControl(['Judge']))).toBeNull();
    });
  });

  describe('when only Recorder is selected', () => {
    it('returns null regardless of formGroup value', () => {
      expect.assertions(1);
      const validator = judgeRecorderConflictValidator(buildFormGroup(null, mockMember('r1')));
      expect(validator(new FormControl(['Recorder']))).toBeNull();
    });
  });

  describe('when Judge and Magistrate are selected (allowed combination)', () => {
    it('returns null', () => {
      expect.assertions(1);
      const validator = judgeRecorderConflictValidator(buildFormGroup(mockMember('j1')));
      expect(validator(new FormControl(['Judge', 'Magistrate']))).toBeNull();
    });
  });

  describe('when Recorder and Magistrate are selected (allowed combination)', () => {
    it('returns null', () => {
      expect.assertions(1);
      const validator = judgeRecorderConflictValidator(buildFormGroup(null, mockMember('r1')));
      expect(validator(new FormControl(['Recorder', 'Magistrate']))).toBeNull();
    });
  });

  describe('when both Judge and Recorder are selected', () => {
    it('returns null when neither has a formGroup value', () => {
      expect.assertions(1);
      const validator = judgeRecorderConflictValidator(buildFormGroup());
      expect(validator(new FormControl(['Judge', 'Recorder']))).toBeNull();
    });

    it('returns null when only Judge has a formGroup value', () => {
      expect.assertions(1);
      const validator = judgeRecorderConflictValidator(buildFormGroup(mockMember('j1')));
      expect(validator(new FormControl(['Judge', 'Recorder']))).toBeNull();
    });

    it('returns null when only Recorder has a formGroup value', () => {
      expect.assertions(1);
      const validator = judgeRecorderConflictValidator(buildFormGroup(null, mockMember('r1')));
      expect(validator(new FormControl(['Judge', 'Recorder']))).toBeNull();
    });

    it('returns judgeRecorderConflict error when both have formGroup values', () => {
      expect.assertions(1);
      const validator = judgeRecorderConflictValidator(
        buildFormGroup(mockMember('j1'), mockMember('r1'))
      );
      expect(validator(new FormControl(['Judge', 'Recorder']))).toEqual({
        judgeRecorderConflict: true
      });
    });
  });
});

describe('judgeRecorderConflictErrorMessages', () => {
  it('contains a judgeRecorderConflict rule entry', () => {
    expect.assertions(1);
    expect(judgeRecorderConflictErrorMessages).toEqual(
      expect.arrayContaining([expect.objectContaining({ rule: 'judgeRecorderConflict' })])
    );
  });
});
