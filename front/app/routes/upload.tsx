import {
    type ActionFunctionArgs,
    json,
    unstable_createMemoryUploadHandler,
    unstable_parseMultipartFormData,
  } from "@remix-run/cloudflare";
  
  type AppEnv = {
    R2: R2Bucket;
  };
  
  export async function action({request, context}: ActionFunctionArgs) {
      const env = context.env as AppEnv
      const uploadHandler = unstable_createMemoryUploadHandler({
          maxPartSize: 3000 * 1024 * 10,
      });
      const form = await unstable_parseMultipartFormData(request, uploadHandler);
      const file = form.get("file") as Blob;
    //   const response = await env.R2.put("file", await file.arrayBuffer(), {
    //       httpMetadata: {
    //           contentType: file.type,
    //       }
    //   })
      return json({object: file})
  }
  
  
  export default function Index() {
      return (
        <div>
          <div>
            <form method={"POST"} encType="multipart/form-data">
              <input type="file" name={"file"} />
              <button type={"submit"}>送信</button>
            </form>
          </div>
          <div>
            <img src="/images/file" alt="" />
          </div>
        </div>
      );
  }
  