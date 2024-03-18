import { ColorMaterial, Components } from "@vertexvis/viewer";
import { FrameCamera } from "@vertexvis/viewer/dist/types/lib/types/frameCamera";
import equal from "fast-deep-equal/es6/react";

interface Req {
  readonly viewer: Components.VertexViewer | null;
}

interface SelectByItemIdReq extends Req {
  readonly color?: string;
  readonly deselectItemId?: string;
  readonly selectItemId?: string;
}

interface HideByItemIdReq extends Req {
  readonly itemId?: string;
}

interface UpdateCameraReq extends Req {
  readonly camera: Partial<FrameCamera>;
}

export function createSelectColor(hex: string): ColorMaterial.ColorMaterial {
  return {
    ...ColorMaterial.fromHex(hex),
    glossiness: 4,
    specular: { r: 255, g: 255, b: 255, a: 0 },
  };
}

export async function selectByItemId({
  color = "#ffff00",
  deselectItemId,
  selectItemId,
  viewer,
}: SelectByItemIdReq): Promise<void> {
  if (viewer == null || (selectItemId == null && deselectItemId == null)) {
    return;
  }

  console.log("selectByItemId:", deselectItemId, selectItemId);

  const scene = await viewer.scene();
  if (scene == null) return;

  await scene
    .items((op) => [
      ...(deselectItemId
        ? [
            op.where((q) => q.withItemId(deselectItemId)).deselect(),
            op
              .where((q) => q.withItemId(deselectItemId))
              .clearMaterialOverrides(),
          ]
        : []),
      ...(selectItemId
        ? [
            op.where((q) => q.withItemId(selectItemId)).select(),
            op
              .where((q) => q.withItemId(selectItemId))
              .materialOverride(createSelectColor(color)),
          ]
        : []),
    ])
    .execute();
}

export async function hideByItemId({
  itemId,
  viewer,
}: HideByItemIdReq): Promise<void> {
  if (viewer == null || itemId == null) return;

  const scene = await viewer.scene();
  if (scene == null) return;

  await scene
    .items((op) => [op.where((q) => q.withItemId(itemId)).hide()])
    .execute();
}

export async function showAll({ viewer }: Req): Promise<void> {
  if (viewer == null) return;

  const scene = await viewer.scene();
  if (scene == null) return;

  await scene.items((op) => [op.where((q) => q.all()).show()]).execute();
}

export async function updateCamera({
  camera,
  viewer,
}: UpdateCameraReq): Promise<void> {
  if (viewer == null || camera == null) return;

  const scene = await viewer.scene();
  if (scene == null) return;

  if (!equal(scene.camera().toFrameCamera(), camera)) {
    await scene.camera().update(camera).render();
  }
}
