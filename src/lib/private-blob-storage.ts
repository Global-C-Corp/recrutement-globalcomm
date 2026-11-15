import path from 'path'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import type { Adapter } from '@payloadcms/plugin-cloud-storage/types'
import { getStorageFilePath } from '@payloadcms/plugin-cloud-storage/utilities'
import { BlobNotFoundError, del, get, put } from '@vercel/blob'
import { isXmlMimeType, UPLOAD_CONTENT_SECURITY_POLICY } from 'payload/internal'
import type { Plugin, UploadCollectionSlug } from 'payload'

/**
 * Payload storage on a PRIVATE Vercel Blob store.
 * The official plugin only supports public blobs. Here files are uploaded with access:'private' and
 * served exclusively through Payload's file route, so collection access rules apply
 * (CVs: HR only; logos: public read). No blob URL is ever exposed.
 */
const createAdapter =
  (token: string): Adapter =>
  ({ collection, prefix = '' }) => ({
    name: 'vercel-blob-private',
    handleUpload: async ({ data, file: { buffer, imageSizeName, mimeType }, storageFilePath }) => {
      const result = await put(storageFilePath, buffer, {
        access: 'private',
        addRandomSuffix: true, // unguessable object names
        contentType: mimeType,
        token,
      })
      const filename = decodeURIComponent(path.posix.basename(result.pathname.replace(/^\/+/, '')))
      if (imageSizeName !== undefined) data.sizes[imageSizeName].filename = filename
      else data.filename = filename
      return data
    },
    handleDelete: async ({ storageFilePath }) => {
      await del(storageFilePath, { token })
    },
    staticHandler: async (req, { doc, headers: incoming, params: { clientUploadContext, filename } }) => {
      try {
        const storageFilePath = await getStorageFilePath({
          clientUploadContext,
          collection,
          collectionPrefix: prefix,
          doc,
          filename,
          req,
        })
        const result = await get(storageFilePath, { access: 'private', token })
        if (!result || result.statusCode !== 200) return new Response(null, { status: 404, statusText: 'Not Found' })

        const headers = new Headers(incoming)
        headers.set('Content-Type', result.blob.contentType)
        headers.set('Content-Length', String(result.blob.size))
        headers.set('Content-Disposition', result.blob.contentDisposition)
        headers.set('X-Content-Type-Options', 'nosniff')
        // Logos are public; everything else (CVs) must never be cached by shared caches.
        headers.set('Cache-Control', collection.slug === 'logo-media' ? 'public, max-age=3600' : 'private, no-store')
        if (isXmlMimeType(result.blob.contentType)) headers.set('Content-Security-Policy', UPLOAD_CONTENT_SECURITY_POLICY)
        return new Response(result.stream, { status: 200, headers })
      } catch (err) {
        if (err instanceof BlobNotFoundError) return new Response(null, { status: 404, statusText: 'Not Found' })
        req.payload.logger.error({ err, msg: 'Erreur de lecture du fichier (stockage privé)' })
        return new Response('Internal Server Error', { status: 500 })
      }
    },
  })

export const privateBlobStorage =
  ({ token, collections }: { token: string | undefined; collections: UploadCollectionSlug[] }): Plugin =>
  (incomingConfig) => {
    if (!token) {
      // No token (local dev): keep the same DB schema, store files on local disk.
      return cloudStoragePlugin({
        alwaysInsertFields: true,
        enabled: false,
        collections: Object.fromEntries(collections.map((c) => [c, { adapter: null }])),
      })(incomingConfig)
    }
    const adapter = createAdapter(token)
    const config = {
      ...incomingConfig,
      collections: (incomingConfig.collections ?? []).map((c) =>
        collections.includes(c.slug as UploadCollectionSlug)
          ? { ...c, upload: { ...(typeof c.upload === 'object' ? c.upload : {}), disableLocalStorage: true } }
          : c,
      ),
    }
    return cloudStoragePlugin({
      alwaysInsertFields: true,
      collections: Object.fromEntries(collections.map((c) => [c, { adapter }])),
    })(config)
  }
