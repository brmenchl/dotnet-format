import { debug, info, warning } from "@actions/core";
import { exec } from "@actions/exec";
import { context } from "@actions/github";
import { which } from "@actions/io";

import { getPullRequestFiles } from "./files";

import type { ExecOptions } from "@actions/exec/lib/interfaces";

export interface FormatOptions {
  dryRun: boolean;
  onlyChangedFiles: boolean;
}

function formatOnlyChangedFiles(onlyChangedFiles: boolean): boolean {
  if (onlyChangedFiles) {
    if (context.eventName === "issue_comment" || context.eventName === "pull_request") {
      return true;
    }

    warning("Formatting only changed files is available on the issue_comment and pull_request events only");

    return false;
  }

  return false;
}

export async function format(options: FormatOptions): Promise<number> {
  const execOptions: ExecOptions = {
    ignoreReturnCode: true,
  };

  const dotnetFormatOptions = ["format"];

  if (options.dryRun) {
    dotnetFormatOptions.push("--check", "--dry-run");
  }

  if (formatOnlyChangedFiles(options.onlyChangedFiles)) {
    const filesToLint = await getPullRequestFiles();

    info(`Linting ${filesToLint.length} files`);

    // if there weren't any files to check then we need to bail
    if (!filesToLint.length) {
      debug("No files found for formatting");
      return 0;
    }

    dotnetFormatOptions.push("--files", filesToLint.join(","));
  }

  const dotnetPath: string = await which("dotnet", true);
  const dotnetResult = await exec(`"${dotnetPath}"`, dotnetFormatOptions, execOptions);

  return dotnetResult;
}