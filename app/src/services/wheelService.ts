import { AddWheelOptionsRequest } from './api/generatedClient';
import { apiClient } from './api/apiClient';

export type Option = {
  id: string;
  name: string;
};

export async function getOptions(): Promise<Option[]> {
  const options = await apiClient.wheel();
  return options.map(({ id, name }) => ({ id, name }));
}

export async function createManyOptions(names: string[]): Promise<void> {
  const wheelOptions = names.map((name) => name.trim()).filter(Boolean);
  if (wheelOptions.length === 0) return;

  await apiClient.add(new AddWheelOptionsRequest({ wheelOptions }));
}

export async function deleteOption(id: string): Promise<void> {
  await apiClient.remove(id);
}
