import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {wait} from './wait'

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
    core.debug(`${path.length}`)
    args.push(
      '--',
      ...path,
    )
  }
  core.debug(`${args}`)

  await exec.getExecOutput(
    '/usr/bin/git',
    args,
    options,
  )

  return myOutput.toString().split("\n")
}

async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')
    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    const br = process.env.GITHUB_BASE_REF?.toString()
    if (br === undefined) {
      throw new Error("set GITHUB_BASE_REF");
    }
    const paths = core.getMultilineInput('paths', {
      required: true,
      trimWhitespace: true,
    });
    const files = await getDiff(br, paths)
    files.forEach(v => {
      core.debug(v)
    })
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
