// 注意：由于浏览器环境不支持Node.js的fs和path模块，
// 我们将修改为使用fetch API异步加载语言资源
interface LanguageResource {
  [key: string]: string;
}

class I18n {
  private resources: Map<string, LanguageResource>;
  private currentLanguage: string;
  private isLoading: boolean = false;

  // 公开的待处理操作队列
  public translateList: Array<() => void> = [];


  constructor(srcPath: string = '/i18n/machines') {
    this.resources = new Map<string, LanguageResource>();
    this.currentLanguage = 'zh';

    // 立即开始加载语言文件
    this.loadLanguagesFromPath(srcPath);
  }

  /**
   * 从指定路径加载所有语言文件
   */
  private async loadLanguagesFromPath(srcPath: string): Promise<void> {
    this.isLoading = true;

    // 为了兼容浏览器环境，我们使用预定义的语言列表
    // 或者通过其他方式获取语言文件列表
    const languageCodes = ['zh']; // 可以根据需要扩展

    // 尝试加载已知的语言文件
    await Promise.all(
      languageCodes.map(langCode => this.loadLanguageFile(langCode, `${srcPath}/${langCode}.json`))
    );

    this.isLoading = false;

    // 执行等待中的操作
    while (this.translateList.length > 0) {
      const op = this.translateList.shift();
      if (op) op();
    }
  }

  /**
   * 加载单个语言文件
   */
  private async loadLanguageFile(langCode: string, filePath: string): Promise<void> {
    try {
      console.log(`Loading language file ${filePath}`);
      const response = await fetch(filePath);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${filePath}: ${response.status} ${response.statusText}`);
      }

      const resources = await response.json() as LanguageResource;
      this.resources.set(langCode, resources);

    } catch (error) {
      console.error(`Error loading language file ${filePath}:`, error);
    }
  }

  /**
   * 在访问数据前检查是否正在加载
   */
  private waitForLoad(callback: () => void): void {
    this.translateList.push(callback);
    if (!this.isLoading) callback();
  }

  /**
   * 公开的API：添加一个待处理的操作
   */
  public addTranslateList(operation: () => void): void {
    this.waitForLoad(operation);
  }

  /**
   * 公开的API：清除所有待处理的操作
   */
  public clearPendingOperations(): void {
    this.translateList = [];
  }

  /**
   * 公开的API：获取待处理操作的数量
   */
  public getPendingOperationCount(): number {
    return this.translateList.length;
  }

  /**
   * 切换当前语言
   */
  public setLanguage(langCode: string): void {
    // 等待加载完成再执行操作
    this.waitForLoad(() => {
      if (this.resources.has(langCode)) {
        this.currentLanguage = langCode;
      } else {
        console.warn(`Language ${langCode} is not loaded.`);
      }
    });
  }

  /**
   * 获取当前语言代码
   */
  public getCurrentLanguage(): string {
    let result = this.currentLanguage;

    this.waitForLoad(() => {
      result = this.currentLanguage;
    });

    return result;
  }

  /**
   * 翻译指定键的文本
   */
  public t(key: string, fallback?: string): string {
    const resource = this.resources.get(this.currentLanguage);

    if (!resource) {
      console.warn(`Current language ${this.currentLanguage} resources not loaded.`);
      if (fallback !== undefined) return fallback;
      else return key;
    }

    const translated = resource[key];
    if (translated !== undefined) return translated;
    else if (resource) {
      console.warn(`Key ${key} not found in language ${this.currentLanguage} resources.`);
      return key;
    }

    return key;
  }

  /**
   * 获取所有已加载的语言
   */
  public getAvailableLanguages(): string[] {
    return Array.from(this.resources.keys());
  }

  /**
   * 添加或更新特定语言的翻译资源
   */
  public addResource(langCode: string, resources: LanguageResource): void {
    if (!this.resources.has(langCode)) {
      this.resources.set(langCode, {});
    }

    Object.assign(this.resources.get(langCode)!, resources);
  }
}

export default I18n;