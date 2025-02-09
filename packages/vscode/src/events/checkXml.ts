import * as vscode from "vscode";
import { parseXML } from "../utils/parse";
import { getAllPosition } from "../utils/file";
import { FileResResolver } from "./fileResResolver";
import { TaskService } from "../services/task";

const FILEREF_PROPERTY_KEYS: string[] = [
  "@_file",
  "@_file_name",
  "@_filename",
  "@_fileref",
  // faction define
  "@_firstnames_file",
  "@_lastnames_file",
  "@_chat_icon_filename",
  "@_chat_icon_filename_supporter",
  "@_chat_icon_commander_filename",
  "@_campaign_completion_icon_filename",
  // vehicle define
  "@_mesh_filename",
  "@_texture_filename",
];

interface IExtractStructFileResItem {
  propertyName: string;
  propertyValue: string;
}

// Recursive function to extract file references
const extractStructFileRef = (
  struct: Record<string, any>,
): IExtractStructFileResItem[] => {
  const result: IExtractStructFileResItem[] = [];

  const traverse = (obj: Record<string, any>) => {
    for (const key in obj) {
      if (FILEREF_PROPERTY_KEYS.includes(key)) {
        const value = obj[key];
        if (typeof value === "string" && value.trim() !== "") {
          result.push({
            propertyName: key,
            propertyValue: value,
          });
        }
      } else if (typeof obj[key] === "object") {
        traverse(obj[key]);
      }
    }
  };

  traverse(struct);
  return result;
};

interface ICheckRes {
  result: boolean;
  properties: Array<{
    name: string;
    file: string;
    result: boolean;
  }>;
}

const checkRefFileExists = async (
  e: vscode.Uri,
  fileContent: string,
  struct: any,
): Promise<ICheckRes> => {
  const checkRes: ICheckRes = {
    result: true,
    properties: [],
  };

  const allStructFileRef = extractStructFileRef(struct);

  if (allStructFileRef.length === 0) {
    return checkRes;
  }

  const allFileRefSet = new Set(allStructFileRef.map((p) => p.propertyValue));
  const globPattern = `**/{${[...allFileRefSet].join(",")}}`;
  const allFieldsResult = await vscode.workspace.findFiles(globPattern);

  // Create a set of available file names directly from the findFiles result
  const allAvaiableFileSet = new Set(
    allFieldsResult.map((u) => {
      const sp = u.path.split("/");
      return sp[sp.length - 1];
    }),
  );

  allStructFileRef.forEach((p) => {
    const result = allAvaiableFileSet.has(p.propertyValue);

    if (!result) {
      checkRes.result = false;
    }
    checkRes.properties.push({
      name: p.propertyName,
      file: p.propertyValue,
      result,
    });
  });

  // mark error
  const rangeList: Array<{
    line: number;
    character: number;
    file: string;
  }> = [];

  checkRes.properties
    .filter((p) => !p.result)
    .forEach((property) => {
      const pos = getAllPosition(fileContent, property.file);

      pos.forEach((p) => {
        rangeList.push({
          line: p.line,
          character: p.character,
          file: property.file,
        });
      });
    });

  if (!checkRes.result) {
    FileResResolver.self().addMissingFileWarn(e, rangeList);
  }

  return checkRes;
};

export const scanFile = async (e: vscode.Uri) => {
  const file = await vscode.workspace.fs.readFile(e);
  const fileContent = file.toString();
  const xmlStruct = parseXML(fileContent);
  // console.log('xmlStruct', xmlStruct); // Commented out for performance

  const checkRes = await checkRefFileExists(e, fileContent, xmlStruct);

  if (!checkRes.result) {
    checkRes.properties.forEach((p) => {
      if (!p.result) {
        console.log(`Resource not found: :${p.file}`);
      }
    });
  }
};

export const startXmlCheckTask = async () => {
  console.log("startXmlCheck");

  if (!TaskService.self().getReady()) {
    return;
  }

  return new Promise<void>((resolve) => {
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Window,
        cancellable: false,
        title: "RWR Mod Tool: Scanning file...",
      },
      async (progress) => {
        progress.report({
          increment: 0,
        });
        // clear warning
        FileResResolver.self().clear();

        // Combined glob pattern for all file types
        const allUri = await vscode.workspace.findFiles(
          "**/{calls/*.xml,calls/*.call,factions/*.models,factions/*.xml,items/*.carry_item,items/*.base,weapons/*.weapon,weapons/*.xml}",
        );

        console.log("allUri", allUri);

        const totalFiles = allUri.length;
        let processed = 0;

        // Report progress every 5 files processed
        const progressIncrement = 5;

        await Promise.all(
          allUri.map(async (f) => {
            await scanFile(f);

            processed++;
            if (processed % progressIncrement === 0 || processed === totalFiles) {
              const progressPercent = (processed / totalFiles) * 100;
              progress.report({
                increment: (progressIncrement / totalFiles) * 100,
                message: `${progressPercent.toFixed()}% (${processed}/${totalFiles})`,
              });
            }
          }),
        );

        resolve();
      },
    );
  });
};
