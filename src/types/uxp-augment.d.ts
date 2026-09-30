// Fills gaps in @adobe/cc-ext-uxp-types for APIs documented in the UXP reference.

declare module "uxp" {
  namespace storage {
    /** https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/FileSystemProvider/ */
    const localFileSystem: FileSystemProvider;
  }
}
