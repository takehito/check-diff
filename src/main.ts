import * as core from '@actions/core'
import {wait} from './wait'
import { exec, spawn } from "node:child_process";

async function getDiff(baseRef: string, ): Promise<void> {
  const git = spawn(
    'git',
    [
      'diff',
      '--name-only',
      '--merge-base',
      baseRef,
      'HEAD',
      // '--',
      // 'infra/dashboard/dashboards/*',
    ],
  )

  git.stdout.on('data', (data) => {
    core.debug(`stdout: ${data}`)
  })
  git.stderr.on('data', (data) => {
    core.debug(`stderr: ${data}`)
  })
  git.on('close', (status) => {
    core.debug(`child process exited with code ${status}`)
  })
}

async function run(): Promise<void> {
  try {
    const ms: string = core.getInput('milliseconds')
    core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true

    const br = process.env.GITHUB_BASE_REF?.toString()
    if (br === undefined) {
      throw new Error("set GITHUB_BASE_REF");
    }
  
    await getDiff(br)

    core.debug(new Date().toTimeString())
    await wait(parseInt(ms, 10))
    core.debug(new Date().toTimeString())

    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
