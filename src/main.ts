import * as core from '@actions/core'
import * as exec from '@actions/exec'

async function getDiff(baseRef: string, path: string[]): Promise<string[]> {
  let myOutput = '';
  let myError = '';

  const options: exec.ExecOptions = {
    listeners: {
      stdout: (data: Buffer) => {
        myOutput += data.toString();
      },
      stderr: (data: Buffer) => {
        myError += data.toString();
      }
    }
  };

  let args = [
    'diff',
    '--name-only',
    '--merge-base',
    baseRef,
    'HEAD',
  ]

  if (path.length > 0) {
    args.push(
      '--',
      ...path,
    )
  }

  await exec.getExecOutput(
    '/usr/bin/git',
    args,
    options,
  )

  return myOutput.toString().trim().split("\n").filter((file): Boolean => { 
    return file.length > 0
  })
}

async function run(): Promise<void> {
  try {
    const br = process.env.GITHUB_BASE_REF?.toString()
    if (br === undefined) {
      throw new Error("set GITHUB_BASE_REF");
    }
    const paths = core.getMultilineInput('paths', {
      required: true,
      trimWhitespace: true,
    });
    const files = await getDiff(br, paths)

    if (files.length > 0) {
      core.setOutput('isDiff', true)
    } else {
      core.setOutput('isDiff', false)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
