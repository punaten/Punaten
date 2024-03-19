import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";

interface Env {
  R2: R2Bucket;
}


export const loader: LoaderFunction = async ({ params, context }) => {
  let env =  context.env as Env;
  const list = await env.R2.list();

  // const key = params.key;
  // console.log("key",key)
  // if (key == null) {
  //   return json({ message: "r2 not found" }, { status: 400 });
  // }

  // const R2  = context.env.R2;
  // if (R2 == null) {
  //   return json({ message: "R2 not found" }, { status: 500 });
  // }
  // const object = await R2.get(key);
  // if (object == null) {
  //   return json({ message: "Object not found" + key }, { status: 404 });
  // }
  // const headers: HeadersInit = new Headers();
  // object.writeHttpMetadata(headers);
  // headers.set("etag", object.etag);
  // return new Response(object.body, { headers });
  return json({ list });
};

export default function Index() {
  return (
    <div>
      <h1>Images</h1>
      <video src="https://pub-dc413e163c2643d082a219ff110a4800.r2.dev/aaa.webm" controls></video>
    </div>
  )
}