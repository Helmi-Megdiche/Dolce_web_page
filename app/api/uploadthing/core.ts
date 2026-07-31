import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getAdminFromRequest } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const admin = getAdminFromRequest(req);
      if (!admin) {
        throw new UploadThingError("Unauthorized");
      }

      return {
        adminId: admin.id,
        email: admin.email,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const url = file.ufsUrl || file.url;

      console.log(
        `[uploadthing] menu image uploaded by ${metadata.email}: ${url}`
      );

      return { url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
