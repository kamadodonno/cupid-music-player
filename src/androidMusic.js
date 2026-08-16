import { Preferences } from '@capacitor/preferences';

export async function saveSongs(tracks) {
  await Preferences.set({
    key: 'savedSongs',
    value: JSON.stringify(tracks),
  });
}

export async function loadSavedSongs() {
  const { value } = await Preferences.get({
    key: 'savedSongs',
  });

  if (!value) return [];

  return JSON.parse(value);
}

export async function getAndroidSongs() {

  try {

    if (window.Android) {

      const songs = JSON.parse(Android.getSongs());

      const tracks = songs.map((song, index) => {

const art =
  song.art && song.art.length > 0
    ? song.art
    : null;

  console.log("ART:", art);

  return {
  id: index,
  file: song.path,
  title: song.title,
  artist: song.artist,
  album: "Local Music",
  albumId: song.albumId,
  art
};
});

      console.log(tracks);

      await saveSongs(tracks);

      return tracks;
    }

    return [];

  } catch (err) {

    console.error(err);

    return [];
  }
}