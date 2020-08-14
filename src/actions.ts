import { getInput, setOutput } from "@actions/core";

import { format, FormatOptions } from "./dotnet";

function buildOptions(check: boolean): FormatOptions {
  const onlyChangedFiles = getInput("only-changed-files") === "true";
  const folder = getInput("folder");
  const workspace = getInput("workspace");
  const exclude = getInput("exclude");
  const include = getInput("include");

  const formatOptions: FormatOptions = {
    onlyChangedFiles,
    check,
  };

  if (folder !== undefined && folder != "") {
    formatOptions.folder = folder;
  } else if (workspace !== undefined && workspace != "") {
    formatOptions.workspace = workspace;
  }

  if (include !== undefined && include != "") {
    formatOptions.include = include;
  }

  if (exclude !== undefined && exclude != "") {
    formatOptions.exclude = exclude;
  }

  return formatOptions;
}

export async function check(): Promise<void> {
  const formatOptions = buildOptions(true);

  const result = await format(formatOptions);

  setOutput("has-changes", result.toString());

  // fail fast will cause the workflow to stop on this job
  const failFast = getInput("fail-fast") === "true";
  if (result && failFast) {
    throw Error("Formatting issues found");
  }
}

export async function fix(): Promise<void> {
  const formatOptions = buildOptions(false);

  const result = await format(formatOptions);

  setOutput("has-changes", result.toString());
}
