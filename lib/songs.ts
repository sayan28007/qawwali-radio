export type Song = {
  id: number;
  title: string;
  artist: string;
  /** seconds — fallback shown until real audio metadata loads */
  duration: number;
  /** expected file at /public/audio/<slug>.mp3 */
  slug: string;
  src: string;
};

const TITLES: string[] = [
  "Tumhain Dillagi Bhool Jani Paray Gi",
  "Sochta Hoon Keh Woh Kitne Masoom Teh",
  "Mast Nazron Se Allah Bachaye",
  "Tu Kuja Man Kuja",
  "Na Rukte Hain Aansoo",
  "Allah Hoo Allah Hoo",
  "Tum Ek Gorakh Dhanda Ho",
  "Halka Halka Saroor",
  "Ankh Uthi Mohabbat Ne",
  "Sanson Ki Mala Pe Simron",
  "Yaad-E-Nabi Ka Gulshan Mehka",
  "Kali Kali Zulfon Ke Phande Na",
  "Aisa Bana Sanwarna Mubarik Tumhen",
  "Main Kahin Bhi Jaon Eh Jaan",
  "Jaag Uthen Dard Purane",
  "Woh Hata Rahe Hain Pardah",
  "Is Karam Ka Karon Shukar Kaise Ada",
  "Dyare Ishq Mein Apna Maqam Paida Kar",
  "Saadgi To Hamari",
  "Mere Nabi Pyare Nabi",
  "Kehte Ho Ishq Ka Afsana Chahiye",
  "Unke Dar Peh Poohnchne To Payen",
  "Jis Ki Janib Woh Nazar Apni Utha",
  "Pilao Saqi",
  "Kehna Ghalat Ghalat",
  "Unse Hi Unki Mulaqat Ho Gayi",
  "Tum Ne Bhi Thukra Hi Diya Hai",
  "Gham Sabhi Rahat O Taskeen",
  "Dard Rukta Nahin Ik Pal Bhi Ishq Ki Yeh Saza Mil Rahi Hai",
  "Botal Khuli Hae Raqs Mein Jam-E-Sharab Hai",
  "Hum Buton Ko Jo Pyar Karte Hain",
  "Meri Ankhon Ko Bakhshe Hain Ansoo",
  "Tu Rah Nawarde Shauq Hai Manzil Na Kar Qabool",
  "Kis Mussarrat Se",
  "Hae Kahan Ka Irada Sanam",
  "Phiroon Dhoondta Maikadah Tauba Tauba",
  "Likh Diya Apne Dar Pe",
  "Doston Ki Shikayat",
  "Aap Baithe Hain Balin Peh Meri",
  "Kya Tha Jo Ghari Bhar Ko Tum Laut Ke Aa Jate",
  "Tere Darwaze Peh Chilman Nahin Dekhi Jati",
  "Haqeeqat Ka Agar Afsana Ban Jaye",
  "Dil Pe Zakham Khate Hain",
  "Gardashon Ke Hain Mare Huye",
  "Ya Hayyo Ya Qayyum",
  "Mustafa Ya Mustafa",
  "Band Hua Sara Maikhana",
  "Ham Apni Sham Ko Jab Nazr-E-Jam Karte Hain",
  "Hae Dil Mein Ishq-e-Nabi Ka Jalwa",
  "Zee Halle Miskin",
  "Longing",
];

function seededDuration(title: string): number {
  let h = 0;
  for (let i = 0; i < title.length; i++) {
    h = (h * 31 + title.charCodeAt(i)) >>> 0;
  }
  // qawwalis run long — spread across roughly 4:30 to 9:45
  return 270 + (h % 315);
}

function slugify(index: number, title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${String(index + 1).padStart(2, "0")}-${base}`;
}

export const songs: Song[] = TITLES.map((title, i) => {
  const slug = slugify(i, title);
  return {
    id: i + 1,
    title,
    artist: "Traditional Qawwali",
    duration: seededDuration(title),
    slug,
    src: `/audio/${slug}.mp3`,
  };
});

export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
