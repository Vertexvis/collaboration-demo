import { Failure, FileList } from "@vertexvis/api-client-node";
import type { NextApiRequest, NextApiResponse } from "next";

import { makeCallAndReturn } from "../../lib/vertex-api";

export default function handle(
  _req: NextApiRequest,
  res: NextApiResponse<FileList | Failure>
): Promise<void> {
  return makeCallAndReturn(res, (client) =>
    client.files.getFiles({ pageSize: 5 })
  );
}
