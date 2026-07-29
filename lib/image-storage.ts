import { Directory, File, Paths } from 'expo-file-system';

const mediaDirectory = new Directory(Paths.document, 'dhulo-media');

export function persistPickedImage(uri: string, prefix: 'note' | 'profile') {
  if (process.env.EXPO_OS === 'web') {
    return uri;
  }

  mediaDirectory.create({ idempotent: true, intermediates: true });
  const source = new File(uri);
  const extension = source.extension || '.jpg';
  const destination = new File(
    mediaDirectory,
    `${prefix}-${Date.now()}-${Math.round(Math.random() * 100_000)}${extension}`
  );
  source.copy(destination);
  return destination.uri;
}
