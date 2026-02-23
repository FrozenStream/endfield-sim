interface LanguageResource {
  [key: string]: string;
}

class I18n {
  private resources: Map<string, LanguageResource>;
  private currentLanguage: string;
  private isLoading: boolean = false;

  // 公开的待处理操作队列
  public translateList: Array<() => void> = [];

  public static instance: I18n = new I18n('/i18n');


  constructor(srcPath: string) {
    this.resources = new Map<string, LanguageResource>();
    this.currentLanguage = 'zh';
    this.loadLanguagesFromPath(`${import.meta.env.BASE_URL}` + srcPath);
  }

  /**
   * 从指定路径加载所有语言文件
   */
  private async loadLanguagesFromPath(srcPath: string): Promise<void> {
    this.isLoading = true;

    const languageCodes = ['zh'];

    await Promise.all(
      languageCodes.map(langCode => this.loadLanguageFile(langCode, `${srcPath}/${langCode}.json`))
    );

    this.isLoading = false;

    // 执行等待中的操作
    this.translateList.forEach(callback => callback());
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

  private waitForLoad(callback: () => void): void {
    this.translateList.push(callback);
    if (!this.isLoading) callback();
  }

  public addTranslateList(operation: () => void): void {
    this.waitForLoad(operation);
  }

  public setLanguage(langCode: string): void {
    this.currentLanguage = langCode;
    this.translateList.forEach(callback => callback());
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
}

export default I18n;