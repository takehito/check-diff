import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {wait} from './wait'

async function getDiff(baseRef: string, path: string): Promise<string[]> {
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

  await exec.getExecOutput(
    'git',
    [
      'diff',
      '--name-only',
      '--merge-base',
      baseRef,
      'HEAD',
      '--',
      path,
    ],
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
    const path = core.getInput('path', {
      required: true,
      trimWhitespace: true,
    });
    const files = await getDiff(br, path)
    files.forEach(v => {
      core.debug(v)
    })

    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
