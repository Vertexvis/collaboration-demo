import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import React from "react";

import { FileData } from "../lib/files";
import { NoData } from "./NoData";

interface Props {
  readonly files: FileData[];
}

export function RecentFiles({ files }: Props): JSX.Element {
  return files.length > 0 ? (
    <TableContainer>
      <Table size="small" style={{ whiteSpace: "nowrap" }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Created</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {files.map((f) => (
            <TableRow key={f.id}>
              <TableCell>{f.name}</TableCell>
              <TableCell>{new Date(f.created).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  ) : (
    <NoData />
  );
}
