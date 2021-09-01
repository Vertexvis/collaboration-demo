import { vertexvis } from "@vertexvis/frame-streaming-protos";

export interface Metadata {
  partName?: string;
  properties: Properties;
}

interface Properties {
  [key: string]: string | undefined;
}

const ItemIdKey = "VERTEX_SCENE_ITEM_ID";
const ItemSuppliedIdKey = "VERTEX_SCENE_ITEM_SUPPLIED_ID";
const PartIdKey = "VERTEX_PART_ID";
const PartRevIdKey = "VERTEX_PART_REVISION_ID";
const PartRevSuppliedId = "VERTEX_PART_REVISION_SUPPLIED_ID";
const PartInstIdKey = "VERTEX_PART_INSTANCE_ID";

export function toMetadata({
  hit,
}: {
  hit?: vertexvis.protobuf.stream.IHit | null;
}): Metadata | undefined {
  if (hit == null) return;

  const ps: Properties = {};
  const {
    itemId,
    itemSuppliedId,
    partRevisionId,
    partId,
    suppliedPartRevisionId: partRevSuppliedId,
  } = hit;
  if (itemId?.hex) ps[ItemIdKey] = itemId.hex;
  if (itemSuppliedId?.value) ps[ItemSuppliedIdKey] = itemSuppliedId.value;
  if (partId?.hex) ps[PartIdKey] = partId.hex;
  if (partRevisionId?.hex) ps[PartRevIdKey] = partRevisionId.hex;
  if (partRevSuppliedId?.value) ps[PartRevSuppliedId] = partRevSuppliedId.value;

  const md = hit?.metadata;
  let partName: string | undefined;
  if (md != null) {
    const { partInstanceId, partName: pn } = md;
    if (partInstanceId?.hex) ps[PartInstIdKey] = partInstanceId.hex;
    partName = pn ?? undefined;

    if (md.properties != null) {
      md.properties
        .filter((p) => p.key)
        .forEach((p) => (ps[p.key as string] = toValue(p)));
    }
  }

  return { partName, properties: alphabetize(ps) };
}

function alphabetize<T extends Record<string, unknown>>(obj: T): T {
  return Object.keys(obj)
    .sort((a, b) => a.localeCompare(b))
    .reduce((acc: T, cur: keyof T) => {
      acc[cur] = obj[cur];
      return acc;
    }, {} as T);
}

function toValue(
  property: vertexvis.protobuf.stream.IMetadataProperty
): string | undefined {
  if (property.asString) return property.asString;
  if (property.asFloat) return property.asFloat.toString();
  if (property.asLong) return property.asLong.toString();
  if (property.asDate) return property.asDate.iso ?? undefined;
  return undefined;
}
