import {
  judiciaryTypeGroupToJudiciaryTypePayload,
  JudiciaryTypePayload,
  mapRefDataJudiciaryToJudiciaryType
} from '@cpp/reference-data';
import { ExtendedJudicialMember } from '../model';

export const filterExists = <T extends object>(payload: T) =>
  Object.keys(payload)
    .filter((key) => payload[key as keyof T] !== undefined && payload[key as keyof T] !== null)
    .reduce(
      (body, key) => ({
        ...body,
        [key]: payload[key as keyof T]
      }),
      {} as T
    );

export const getJudiciaryType = (
  judiciary: ExtendedJudicialMember | null
): JudiciaryTypePayload | null => {
  if (!judiciary) {
    return null;
  }
  return judiciaryTypeGroupToJudiciaryTypePayload(
    mapRefDataJudiciaryToJudiciaryType(judiciary.judiciaryType)
  );
};

export const getJudiciaryTypes = (
  judiciaries: ExtendedJudicialMember[] | null
): JudiciaryTypePayload[] | null => {
  if (!judiciaries) {
    return null;
  }
  return judiciaries.map((judiciary) => getJudiciaryType(judiciary));
};
