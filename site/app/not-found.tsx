import { Shell } from './Shell';

/** Олдохгүй хаяг (404). ubmn-404: app.js өөрийн 404 хуудсаа харуулна. */
export default function NotFound() {
  return (
    <>
      <title>Хуудас олдсонгүй · ulaanbaatar.mn</title>
      <meta name="robots" content="noindex" />
      <meta name="ubmn-404" content="1" />
      <Shell notFound />
    </>
  );
}
