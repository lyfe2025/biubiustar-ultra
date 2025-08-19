import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

/**
 * 视频封面生成工具类
 */
export class VideoThumbnailGenerator {
  /**
   * 生成视频封面图片
   * @param videoPath 视频文件路径
   * @param outputPath 输出封面图片路径
   * @param timeOffset 截取时间点（秒），默认为1秒
   * @returns Promise<boolean> 是否成功生成封面
   */
  static async generateThumbnail(
    videoPath: string,
    outputPath: string,
    timeOffset: number = 1
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // 检查视频文件是否存在
      if (!fs.existsSync(videoPath)) {
        console.error(`视频文件不存在: ${videoPath}`)
        resolve(false)
        return
      }

      // 确保输出目录存在
      const outputDir = path.dirname(outputPath)
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      // 使用ffmpeg生成缩略图
      const ffmpeg = spawn('ffmpeg', [
        '-i', videoPath,           // 输入视频文件
        '-ss', timeOffset.toString(), // 截取时间点
        '-vframes', '1',           // 只截取一帧
        '-q:v', '2',              // 高质量
        '-vf', 'scale=320:240',   // 缩放到合适尺寸
        '-y',                     // 覆盖输出文件
        outputPath                // 输出路径
      ])

      let errorOutput = ''

      ffmpeg.stderr.on('data', (data) => {
        errorOutput += data.toString()
      })

      ffmpeg.on('close', (code) => {
        if (code === 0 && fs.existsSync(outputPath)) {
          console.log(`视频封面生成成功: ${outputPath}`)
          resolve(true)
        } else {
          console.error(`视频封面生成失败，退出码: ${code}`)
          console.error(`错误信息: ${errorOutput}`)
          resolve(false)
        }
      })

      ffmpeg.on('error', (error) => {
        console.error(`ffmpeg进程错误: ${error.message}`)
        resolve(false)
      })
    })
  }

  /**
   * 为上传的视频文件生成封面
   * @param videoFilename 视频文件名
   * @param uploadDir 上传目录
   * @returns Promise<string | null> 封面图片的相对路径，失败返回null
   */
  static async generateThumbnailForUpload(
    videoFilename: string,
    uploadDir: string
  ): Promise<string | null> {
    try {
      const videoPath = path.join(uploadDir, videoFilename)
      const thumbnailFilename = this.getThumbnailFilename(videoFilename)
      const thumbnailPath = path.join(uploadDir, thumbnailFilename)

      const success = await this.generateThumbnail(videoPath, thumbnailPath)
      
      if (success) {
        // 返回相对于public目录的路径
        return `/uploads/posts/${thumbnailFilename}`
      }
      
      return null
    } catch (error) {
      console.error('生成视频封面时发生错误:', error)
      return null
    }
  }

  /**
   * 根据视频文件名生成封面图片文件名
   * @param videoFilename 视频文件名
   * @returns 封面图片文件名
   */
  static getThumbnailFilename(videoFilename: string): string {
    const nameWithoutExt = path.parse(videoFilename).name
    return `${nameWithoutExt}_thumb.jpg`
  }

  /**
   * 检查系统是否安装了ffmpeg
   * @returns Promise<boolean>
   */
  static async checkFFmpegAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      const ffmpeg = spawn('ffmpeg', ['-version'])
      
      ffmpeg.on('close', (code) => {
        resolve(code === 0)
      })
      
      ffmpeg.on('error', () => {
        resolve(false)
      })
    })
  }

  /**
   * 删除视频对应的封面文件
   * @param videoFilename 视频文件名
   * @param uploadDir 上传目录
   */
  static deleteThumbnail(videoFilename: string, uploadDir: string): void {
    try {
      const thumbnailFilename = this.getThumbnailFilename(videoFilename)
      const thumbnailPath = path.join(uploadDir, thumbnailFilename)
      
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath)
        console.log(`删除视频封面: ${thumbnailPath}`)
      }
    } catch (error) {
      console.error('删除视频封面时发生错误:', error)
    }
  }
}