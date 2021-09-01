import type { Environment } from "@vertexvis/viewer";
import { GetServerSidePropsResult } from "next";
import React from "react";

import { Home } from "../components/Home";
import { Config } from "../lib/config";

export interface Props {
  readonly vertexEnv: Environment;
}

export default function Index(props: Props): JSX.Element {
  return <Home {...props} />;
}

export function getServerSideProps(): GetServerSidePropsResult<Props> {
  return { props: { vertexEnv: Config.vertexEnv } };
}
