import React from 'react';

import cSharpIcon from '../../assets/icon/file/c#.png';
import cppIcon from '../../assets/icon/file/cpp.png';
import cssIcon from '../../assets/icon/file/css.png';
import goIcon from '../../assets/icon/file/go.png';
import htmlIcon from '../../assets/icon/file/html.png';
import javaIcon from '../../assets/icon/file/java.png';
import jsIcon from '../../assets/icon/file/js.png';
import jsonIcon from '../../assets/icon/file/json.png';
import jsxIcon from '../../assets/icon/file/jsx.png';
import kotlinIcon from '../../assets/icon/file/kotlin.png';
import phpIcon from '../../assets/icon/file/php.png';
import pythonIcon from '../../assets/icon/file/python.png';
import rubyIcon from '../../assets/icon/file/ruby.png';
import sassIcon from '../../assets/icon/file/sass.png';
import tsxIcon from '../../assets/icon/file/tsx.png';
import tsIcon from '../../assets/icon/file/typescript.png';


const FileIcon = ({ fileName, size = 20, className = "" }) => {
  const extension = fileName.split('.').pop().toLowerCase();

  const SvgWrapper = ({ children, viewBox = "0 0 32 32" }) => (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );

  const icons = {
    // Languages
    java: <img src={javaIcon} alt="java" width={size} height={size} className={className} />,
    js: <img src={jsIcon} alt="js" width={size} height={size} className={className} />,
    ts: <img src={tsIcon} alt="ts" width={size} height={size} className={className} />,
    go: <img src={goIcon} alt="go" width={size} height={size} className={className} />,
    rb: <img src={rubyIcon} alt="ruby" width={size} height={size} className={className} />,
    php: <img src={phpIcon} alt="php" width={size} height={size} className={className} />,
    py: <img src={pythonIcon} alt="py" width={size} height={size} className={className} />,
    scala: (
      <SvgWrapper>
        <path fill="#DE3423" d="M8 6h3v20H8zm6 0h3v20h-3zm6 0h3v20h-3z" />
      </SvgWrapper>
    ),
    rs: (
      <SvgWrapper>
        <path fill="#000" d="M16 2a14 14 0 0 0-4.2 27.3V25l2.6-1.5v-2.3L12 19.8V17h8v2.8l-2.4 1.4v2.3l2.6 1.5v4.3A14 14 0 0 0 16 2zm-4.5 12.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
      </SvgWrapper>
    ),
    cs: <img src={cSharpIcon} alt="cs" width={size} height={size} className={className} />,
    cpp: <img src={cppIcon} alt="cpp" width={size} height={size} className={className} />,
    css: <img src={cssIcon} alt="css" width={size} height={size} className={className} />,
    html: <img src={htmlIcon} alt="html" width={size} height={size} className={className} />,
    json: <img src={jsonIcon} alt="json" width={size} height={size} className={className} />,
    jsx: <img src={jsxIcon} alt="jsx" width={size} height={size} className={className} />,
    kt: <img src={kotlinIcon} alt="kt" width={size} height={size} className={className} />,
    sass: <img src={sassIcon} alt="sass" width={size} height={size} className={className} />,
    tsx: <img src={tsxIcon} alt="tsx" width={size} height={size} className={className} />,

    // Tools & Others
    docker: (
      <SvgWrapper>
        <path fill="#2496ED" d="M29.5 12.6c-.3-.2-1-.3-1.9-.3-.5 0-.9 0-1.4.1.1-.5.1-1.1.1-1.7 0-3.3-2.7-6-6-6-.4 0-.7 0-1.1.1-.1-2.2-2-4-4.2-4s-4.1 1.8-4.2 4c-.4-.1-.7-.1-1.1-.1-3.3 0-6 2.7-6 6 0 .6 0 1.2.1 1.7-.5-.1-1-.1-1.4-.1-.9 0-1.6.1-1.9.3C.1 12.9 0 13.5 0 14.1c0 2.2 1.3 4.1 3.2 5 0 .1 0 .2-.1.3-.1 2.3 1.7 4.2 4 4.3.4 0 .8 0 1.1-.1.1 2.2 2 4 4.2 4s4.1-1.8 4.2-4c.4.1.8.1 1.1.1 2.3-.1 4.1-2 4-4.3 0-.1 0-.2-.1-.3 1.9-.9 3.2-2.8 3.2-5 0-.6-.1-1.2-.3-1.5z" />
      </SvgWrapper>
    ),
    txt: (
      <SvgWrapper>
        <path fill="#757575" d="M6 4v24h20V10l-6-6H6zm14 7V5.5l5.5 5.5H20zM9 12h6v2H9v-2zm0 4h14v2H9v-2zm0 4h14v2H9v-2z" />
      </SvgWrapper>
    ),
    pdf: (
      <SvgWrapper>
        <path fill="#FF2D20" d="M6 4v24h20V10l-6-6H6zm14 7V5.5l5.5 5.5H20zM12 18h2v2h-2v-2zm0-5h2v4h-2v-4z" />
      </SvgWrapper>
    ),

    // Fallback
    default: (
      <SvgWrapper>
        <path fill="#9E9E9E" d="M6 2h14l6 6v22H6V2zm13 1v5h5l-5-5z" />
      </SvgWrapper>
    )
  };

  // Special mappings for common alternative extensions
  const extensionMap = {
    jsx: 'jsx',
    tsx: 'tsx',
    pyc: 'py',
    dockerfile: 'docker',
    yml: 'txt',
    md: 'txt'
  };

  const lookup = extensionMap[extension] || extension;
  const iconPath = icons[lookup] || icons.default;

  return iconPath;
};

export default FileIcon;
