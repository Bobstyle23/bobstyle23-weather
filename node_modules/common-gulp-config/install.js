const fs = require("fs-extra");
const path = require("path");

const directories = [
  {
    src: path.join(__dirname, "build"),
    dest: path.join(process.cwd(), "build"),
  },
  { src: path.join(__dirname, "docs"), dest: path.join(process.cwd(), "docs") },
  { src: path.join(__dirname, "gulp"), dest: path.join(process.cwd(), "gulp") },
  { src: path.join(__dirname, "src"), dest: path.join(process.cwd(), "src") },
  {
    src: path.join(__dirname, "gulpfile.js"),
    dest: path.join(process.cwd(), "gulpfile.js"),
  },
  {
    src: path.join(__dirname, "webpack.config.js"),
    dest: path.join(process.cwd(), "webpack.config.js"),
  },
  {
    src: path.join(__dirname, "utilities.js"),
    dest: path.join(process.cwd(), "utilities.js"),
  },
];

async function compareAndCopy(src, dest) {
  try {
    const exists = await fs.pathExists(dest);

    if (exists) {
      const srcStats = await fs.stat(src);
      const destStats = await fs.stat(dest);

      if (srcStats.isDirectory() && destStats.isDirectory()) {
        const srcFiles = await fs.readdir(src);
        for (const file of srcFiles) {
          const srcFilePath = path.join(src, file);
          const destFilePath = path.join(dest, file);
          await compareAndCopy(srcFilePath, destFilePath);
        }
      } else if (srcStats.isFile() && destStats.isFile()) {
        const srcContent = await fs.readFile(src, "utf-8");
        const destContent = await fs.readFile(dest, "utf-8");

        if (srcContent !== destContent) {
          const backupDest = `${dest}.backup`;
          await fs.copy(dest, backupDest);
          console.log(`Backup created for modified file: ${backupDest}`);

          await fs.copy(src, dest);
          console.log(`Updated file: ${dest}`);
        } else {
          console.log(`File ${dest} is already up-to-date.`);
        }
      }
    } else {
      await fs.copy(src, dest);
      console.log(`Copied ${src} to ${dest}`);
    }
  } catch (err) {
    console.error(`Error while copying ${src} to ${dest}:`, err);
  }
}

async function copyDirectories() {
  for (const { src, dest } of directories) {
    await compareAndCopy(src, dest);
  }
  console.log("Update process completed.");
}

copyDirectories();
