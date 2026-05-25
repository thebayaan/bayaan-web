import type { SVGProps } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  filled?: boolean;
}

export function HomeIcon({ size = 24, color = "currentColor", filled, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {filled ? (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.9931 3.43368C12.8564 2.42331 11.1436 2.42331 10.0069 3.43368L2.33565 10.2526C1.92286 10.6195 1.88568 11.2516 2.2526 11.6644C2.61952 12.0771 3.25159 12.1143 3.66437 11.7474L4.00001 11.4491L4.00001 17.0658C3.99996 17.9523 3.99992 18.7161 4.08215 19.3278C4.17028 19.9833 4.36903 20.6117 4.87869 21.1213C5.38835 21.631 6.0167 21.8297 6.67222 21.9179C7.28388 22.0001 8.04769 22 8.93418 22H15.0658C15.9523 22 16.7161 22.0001 17.3278 21.9179C17.9833 21.8297 18.6117 21.631 19.1213 21.1213C19.631 20.6117 19.8297 19.9833 19.9179 19.3278C20.0001 18.7161 20.0001 17.9523 20 17.0659L20 11.4491L20.3356 11.7474C20.7484 12.1143 21.3805 12.0771 21.7474 11.6644C22.1143 11.2516 22.0772 10.6195 21.6644 10.2526L13.9931 3.43368ZM12 16C11.4477 16 11 16.4477 11 17V19C11 19.5523 10.5523 20 10 20C9.44772 20 9 19.5523 9 19V17C9 15.3431 10.3431 14 12 14C13.6569 14 15 15.3431 15 17V19C15 19.5523 14.5523 20 14 20C13.4477 20 13 19.5523 13 19V17C13 16.4477 12.5523 16 12 16Z"
          fill={color}
        />
      ) : (
        <>
          <path
            d="M19 9L19 17C19 18.8856 19 19.8284 18.4142 20.4142C17.8284 21 16.8856 21 15 21L14 21L10 21L9 21C7.11438 21 6.17157 21 5.58579 20.4142C5 19.8284 5 18.8856 5 17L5 9"
            stroke={color}
            strokeWidth={2}
            strokeLinejoin="round"
          />
          <path
            d="M3 11L7.5 7L10.6713 4.18109C11.429 3.50752 12.571 3.50752 13.3287 4.18109L16.5 7L21 11"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 21V17C10 15.8954 10.8954 15 12 15V15C13.1046 15 14 15.8954 14 17V21"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
}

export function SearchIcon({ size = 24, color = "currentColor", filled, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <g fill={color}>
        {filled ? (
          <path d="M2,10.5 C2,5.80558 5.80558,2 10.5,2 C15.1944,2 19,5.80558 19,10.5 C19,12.4869 18.3183,14.3145 17.176,15.7618 L20.8284,19.4142 C21.2189,19.8047 21.2189,20.4379 20.8284,20.8284 C20.4379,21.2189 19.8047,21.2189 19.4142,20.8284 L15.7618,17.176 C14.3145,18.3183 12.4869,19 10.5,19 C5.80558,19 2,15.1944 2,10.5 Z M10.5,6 C9.94772,6 9.5,6.44772 9.5,7 C9.5,7.55228 9.94772,8 10.5,8 C11.8807,8 13,9.11929 13,10.5 C13,11.0523 13.4477,11.5 14,11.5 C14.5523,11.5 15,11.0523 15,10.5 C15,8.01472 12.9853,6 10.5,6 Z" />
        ) : (
          <path d="M10.5,4 C6.91015,4 4,6.91015 4,10.5 C4,14.0899 6.91015,17 10.5,17 C14.0899,17 17,14.0899 17,10.5 C17,6.91015 14.0899,4 10.5,4 Z M2,10.5 C2,5.80558 5.80558,2 10.5,2 C15.1944,2 19,5.80558 19,10.5 C19,12.4869 18.3183,14.3145 17.176,15.7618 L20.8284,19.4142 C21.2189,19.8047 21.2189,20.4379 20.8284,20.8284 C20.4379,21.2189 19.8047,21.2189 19.4142,20.8284 L15.7618,17.176 C14.3145,18.3183 12.4869,19 10.5,19 C5.80558,19 2,15.1944 2,10.5 Z M9.5,7 C9.5,6.44772 9.94772,6 10.5,6 C12.9853,6 15,8.01472 15,10.5 C15,11.0523 14.5523,11.5 14,11.5 C13.4477,11.5 13,11.0523 13,10.5 C13,9.11929 11.8807,8 10.5,8 C9.94772,8 9.5,7.55228 9.5,7 Z" />
        )}
      </g>
    </svg>
  );
}

export function CollectionIcon({ size = 24, color = "currentColor", filled, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {filled ? (
        <g fill={color}>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.67239 7.54199H15.3276C18.7024 7.54199 20.3898 7.54199 21.3377 8.52882C22.2855 9.51565 22.0625 11.0403 21.6165 14.0895L21.1935 16.9811C20.8437 19.3723 20.6689 20.5679 19.7717 21.2839C18.8745 21.9999 17.5512 21.9999 14.9046 21.9999H9.09536C6.44881 21.9999 5.12553 21.9999 4.22834 21.2839C3.33115 20.5679 3.15626 19.3723 2.80648 16.9811L2.38351 14.0895C1.93748 11.0403 1.71447 9.51565 2.66232 8.52882C3.61017 7.54199 5.29758 7.54199 8.67239 7.54199ZM8 18.0001C8 17.5859 8.3731 17.2501 8.83333 17.2501H15.1667C15.6269 17.2501 16 17.5859 16 18.0001C16 18.4143 15.6269 18.7501 15.1667 18.7501H8.83333C8.3731 18.7501 8 18.4143 8 18.0001Z"
          />
          <path
            opacity="0.4"
            d="M8.51005 2.00001H15.4901C15.7226 1.99995 15.9009 1.99991 16.0567 2.01515C17.1645 2.12352 18.0712 2.78958 18.4558 3.68678H5.54443C5.92895 2.78958 6.8357 2.12352 7.94352 2.01515C8.09933 1.99991 8.27757 1.99995 8.51005 2.00001Z"
          />
          <path
            opacity="0.7"
            d="M6.31069 4.72266C4.92007 4.72266 3.7798 5.56241 3.39927 6.67645C3.39134 6.69967 3.38374 6.72302 3.37646 6.74647C3.77461 6.6259 4.18898 6.54713 4.60845 6.49336C5.68882 6.35485 7.05416 6.35492 8.64019 6.35501L8.75863 6.35501L15.5323 6.35501C17.1183 6.35492 18.4837 6.35485 19.564 6.49336C19.9835 6.54713 20.3979 6.6259 20.796 6.74647C20.7887 6.72302 20.7811 6.69967 20.7732 6.67645C20.3927 5.56241 19.2524 4.72266 17.8618 4.72266H6.31069Z"
          />
        </g>
      ) : (
        <g stroke={color} strokeWidth="1.5">
          <path
            opacity="0.5"
            d="M19.5617 7C19.7904 5.69523 18.7863 4.5 17.4617 4.5H6.53788C5.21323 4.5 4.20922 5.69523 4.43784 7M17.4999 4.5C17.5283 4.24092 17.5425 4.11135 17.5427 4.00435C17.545 2.98072 16.7739 2.12064 15.7561 2.01142C15.6497 2 15.5194 2 15.2588 2H8.74099C8.48035 2 8.35002 2 8.24362 2.01142C7.22584 2.12064 6.45481 2.98072 6.45704 4.00434C6.45727 4.11135 6.47146 4.2409 6.49983 4.5"
          />
          <path d="M15 18H9" strokeLinecap="round" />
          <path d="M2.38351 13.793C1.93748 10.6294 1.71447 9.04765 2.66232 8.02383C3.61017 7 5.29758 7 8.67239 7H15.3276C18.7024 7 20.3898 7 21.3377 8.02383C22.2855 9.04765 22.0625 10.6294 21.6165 13.793L21.1935 16.793C20.8437 19.2739 20.6689 20.5143 19.7717 21.2572C18.8745 22 17.5512 22 14.9046 22H9.09536C6.44881 22 5.12553 22 4.22834 21.2572C3.33115 20.5143 3.15626 19.2739 2.80648 16.793L2.38351 13.793Z" />
        </g>
      )}
    </svg>
  );
}

export function PlayIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="60 35 85 95" fill="none" {...props}>
      <path
        d="M107.15 59.10Q127.37 70.78 141.57 80.96Q142.96 81.95 142.96 84.00Q142.96 86.06 141.57 87.05Q127.37 97.22 107.14 108.90Q86.91 120.58 71.00 127.79Q69.45 128.49 67.67 127.46Q65.89 126.44 65.73 124.74Q64.01 107.36 64.02 84.00Q64.02 60.64 65.73 43.25Q65.90 41.56 67.68 40.53Q69.45 39.51 71.01 40.21Q86.92 47.42 107.15 59.10Z"
        fill={color}
      />
    </svg>
  );
}

export function PauseIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="45 65 75 85" fill="none" {...props}>
      <path
        d="M77.95 109.01Q77.91 145.29 77.87 148.51A0.47 0.47 0.0 0177.40 148.97Q65.96 149.08 52.57 148.91Q49.83 148.88 49.21 145.69Q45.94 128.98 45.96 108.98Q45.98 88.98 49.28 72.27Q49.91 69.09 52.65 69.06Q66.04 68.92 77.48 69.05A0.47 0.47 0.0 0177.94 69.51Q77.98 72.73 77.95 109.01Z"
        fill={color}
      />
      <path
        d="M118.00 108.98Q118.02 128.97 114.75 145.69Q114.12 148.87 111.38 148.90Q97.99 149.07 86.55 148.96A0.47 0.47 0.0 0186.09 148.51Q86.04 145.28 86.01 109.01Q85.97 72.73 86.01 69.51A0.47 0.47 0.0 0186.48 69.05Q97.92 68.92 111.31 69.06Q114.05 69.09 114.68 72.27Q117.98 88.98 118.00 108.98Z"
        fill={color}
      />
    </svg>
  );
}

export function NextIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="220 80 55 55" fill="none" {...props}>
      <path
        d="M270.02 108.99Q269.97 119.56 269.99 132.05Q270.00 132.99 269.06 132.99L267.03 132.99Q266.06 132.99 266.06 132.02L266.06 112.27A0.32 0.32 0.0 00265.56 112.01Q262.59 114.07 260.45 115.39Q245.43 124.66 227.58 132.30C224.74 133.52 223.07 133.07 222.84 129.72Q222.02 118.13 222.02 109.00Q222.02 99.88 222.82 88.29C223.05 84.94 224.72 84.49 227.56 85.70Q245.42 93.33 260.45 102.59Q262.59 103.91 265.56 105.96A0.32 0.32 0.0 00266.06 105.70L266.04 85.95Q266.04 84.98 267.01 84.98L269.04 84.98Q269.98 84.98 269.98 85.92Q269.96 98.41 270.02 108.99Z"
        fill={color}
      />
    </svg>
  );
}

export function PreviousIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="220 80 55 55" fill="none" {...props}>
      <g transform="translate(492, 0) scale(-1, 1)">
        <path
          d="M270.02 108.99Q269.97 119.56 269.99 132.05Q270.00 132.99 269.06 132.99L267.03 132.99Q266.06 132.99 266.06 132.02L266.06 112.27A0.32 0.32 0.0 00265.56 112.01Q262.59 114.07 260.45 115.39Q245.43 124.66 227.58 132.30C224.74 133.52 223.07 133.07 222.84 129.72Q222.02 118.13 222.02 109.00Q222.02 99.88 222.82 88.29C223.05 84.94 224.72 84.49 227.56 85.70Q245.42 93.33 260.45 102.59Q262.59 103.91 265.56 105.96A0.32 0.32 0.0 00266.06 105.70L266.04 85.95Q266.04 84.98 267.01 84.98L269.04 84.98Q269.98 84.98 269.98 85.92Q269.96 98.41 270.02 108.99Z"
          fill={color}
        />
      </g>
    </svg>
  );
}

export function HeartIcon({ size = 24, color = "currentColor", filled, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {filled ? (
        <path
          d="M12 5.95q0.06 0 0.07-0.01c1.75-2.18 5.25-3.94 7.46-1.13 0.97 1.24 0.83 2.98 0.3 4.42-1.19 3.24-4.22 6.13-7.34 7.52q-0.17 0.08-0.48 0.08t-0.48-0.08c-3.12-1.38-6.15-4.28-7.34-7.52c-0.53-1.44-0.67-3.18 0.3-4.42 2.21-2.81 5.71-1.05 7.46 1.13q0.01 0.01 0.07 0.01z"
          fill={color}
        />
      ) : (
        <path
          d="M12 5.95q0.06 0 0.07-0.01c1.75-2.18 5.25-3.94 7.46-1.13 0.97 1.24 0.83 2.98 0.3 4.42-1.19 3.24-4.22 6.13-7.34 7.52q-0.17 0.08-0.48 0.08t-0.48-0.08c-3.12-1.38-6.15-4.28-7.34-7.52c-0.53-1.44-0.67-3.18 0.3-4.42 2.21-2.81 5.71-1.05 7.46 1.13q0.01 0.01 0.07 0.01z"
          stroke={color}
          strokeWidth={1.5}
          fill="none"
        />
      )}
    </svg>
  );
}

export function QuranIcon({ size = 24, color = "currentColor", filled, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="12 12 52 49" fill="none" {...props}>
      {filled ? (
        <path
          fillRule="evenodd"
          fill={color}
          d="M 16.00,16.25 L 16.00,16.50 L 15.50,17.00 L 14.00,17.25 L 14.25,40.75 L 15.50,40.75 L 16.00,41.25 L 16.00,41.50 L 17.50,41.75 L 18.00,42.25 L 18.00,42.50 L 19.50,42.75 L 20.00,43.25 L 20.00,43.50 L 21.50,43.75 L 22.00,44.50 L 24.50,44.75 L 25.00,45.25 L 25.00,45.50 L 26.50,45.75 L 27.00,46.50 L 29.50,46.75 L 30.00,47.25 L 30.50,47.75 L 31.00,48.50 L 30.50,49.00 L 29.00,49.25 L 29.00,49.50 L 28.50,50.00 L 26.00,50.25 L 26.00,50.50 L 25.50,51.00 L 23.00,51.25 L 22.50,52.00 L 21.00,52.25 L 21.00,52.50 L 20.50,53.00 L 18.00,53.25 L 18.25,58.75 L 19.75,58.50 L 20.25,57.75 L 21.75,57.50 L 21.75,57.25 L 22.25,56.75 L 24.75,56.50 L 25.25,55.75 L 26.75,55.50 L 26.75,55.25 L 27.25,54.75 L 28.75,54.50 L 28.75,54.25 L 29.25,53.75 L 31.75,53.50 L 32.25,52.75 L 33.75,52.50 L 33.75,52.25 L 34.25,51.75 L 36.75,51.50 L 36.75,51.25 L 37.25,50.75 L 38.50,50.75 L 39.00,51.25 L 39.00,51.50 L 41.50,51.75 L 42.00,52.25 L 42.00,52.50 L 43.50,52.75 L 44.00,53.25 L 44.00,53.50 L 45.50,53.75 L 46.00,54.50 L 48.50,54.75 L 49.00,55.25 L 49.00,55.50 L 50.50,55.75 L 51.00,56.25 L 51.00,56.50 L 52.50,56.75 L 53.00,57.50 L 55.50,57.75 L 56.00,58.50 L 57.75,58.50 L 57.50,53.00 L 55.25,53.00 L 54.75,52.50 L 54.75,52.25 L 53.25,52.00 L 52.75,51.25 L 50.25,51.00 L 49.75,50.50 L 49.75,50.25 L 47.25,50.00 L 46.75,49.50 L 46.75,49.25 L 45.25,49.00 L 44.75,48.25 L 45.25,47.75 L 45.75,47.25 L 46.25,46.75 L 48.75,46.50 L 49.25,45.75 L 50.75,45.50 L 50.75,45.25 L 51.25,44.75 L 52.75,44.50 L 52.75,44.25 L 53.25,43.75 L 55.75,43.50 L 56.25,42.75 L 57.75,42.50 L 57.75,42.25 L 58.25,41.75 L 59.75,41.50 L 59.75,41.25 L 60.25,40.75 L 61.75,40.50 L 61.50,17.00 L 60.25,17.00 L 59.75,16.50 L 59.75,16.25 L 59.00,16.25 L 59.00,36.50 L 58.50,37.00 L 57.00,37.25 L 57.00,37.50 L 56.50,38.00 L 55.00,38.25 L 55.00,38.50 L 54.50,39.00 L 53.00,39.25 L 53.00,39.50 L 52.50,40.00 L 50.00,40.25 L 49.50,41.00 L 48.00,41.25 L 48.00,41.50 L 47.50,42.00 L 46.00,42.25 L 46.00,42.50 L 45.50,43.00 L 43.00,43.25 L 42.50,44.00 L 41.00,44.25 L 41.00,44.50 L 40.50,45.00 L 38.00,45.25 L 38.00,45.50 L 37.25,46.00 L 36.75,45.50 L 36.75,45.25 L 35.25,45.00 L 34.75,44.50 L 34.75,44.25 L 33.25,44.00 L 32.75,43.25 L 30.25,43.00 L 29.75,42.50 L 29.75,42.25 L 28.25,42.00 L 27.75,41.50 L 27.75,41.25 L 26.25,41.00 L 25.75,40.25 L 23.25,40.00 L 22.75,39.50 L 22.75,39.25 L 21.25,39.00 L 20.75,38.50 L 20.75,38.25 L 19.25,38.00 L 18.75,37.50 L 18.75,37.25 L 17.25,37.00 L 16.75,36.50 L 16.50,16.00 Z M 19.00,14.25 L 19.25,34.75 L 20.50,34.75 L 21.00,35.25 L 21.00,35.50 L 22.50,35.75 L 23.00,36.50 L 25.50,36.75 L 26.00,37.50 L 29.50,37.75 L 30.00,38.25 L 30.00,38.50 L 31.50,38.75 L 32.00,39.25 L 32.00,39.50 L 33.50,39.75 L 34.00,40.25 L 35.00,41.25 L 35.00,41.50 L 35.25,41.75 L 37.00,43.50 L 37.75,43.50 L 38.50,42.75 L 38.75,42.50 L 39.50,41.75 L 39.75,41.50 L 40.75,40.25 L 41.25,39.75 L 42.75,39.50 L 42.75,39.25 L 43.25,38.75 L 45.75,38.50 L 45.75,38.25 L 46.25,37.75 L 48.75,37.50 L 48.75,37.25 L 49.25,36.75 L 51.75,36.50 L 52.25,35.75 L 53.75,35.50 L 53.75,35.25 L 54.25,34.75 L 55.75,34.50 L 55.50,14.00 L 53.00,14.25 L 52.50,15.00 L 51.00,15.25 L 51.00,15.50 L 50.50,16.00 L 48.00,16.25 L 48.00,16.50 L 47.50,17.00 L 43.00,17.25 L 42.50,18.00 L 40.00,18.25 L 40.00,18.50 L 38.50,20.00 L 38.25,20.00 L 38.00,21.50 L 37.25,22.00 L 36.75,21.50 L 36.25,21.00 L 35.75,20.50 L 35.50,19.00 L 34.25,19.00 L 33.75,18.25 L 31.25,18.00 L 30.75,17.25 L 26.25,17.00 L 25.75,16.50 L 25.75,16.25 L 23.25,16.00 L 22.75,15.50 L 21.75,14.50 L 21.75,14.25 Z"
        />
      ) : (
        <g fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M 21 14 L 16 16 L 14 17 L 14 41 L 31 48.5 L 18 53 L 18 59 L 38 51"
            strokeWidth={2.5}
          />
          <path
            d="M 55 14 L 60 16 L 62 17 L 62 41 L 45 48.5 L 58 53 L 58 59 L 38 51"
            strokeWidth={2.5}
          />
          <path d="M 17 16 L 17 37 L 38 46" strokeWidth={2} />
          <path d="M 59 16 L 59 37 L 38 46" strokeWidth={2} />
          <path d="M 22 14 L 19 14 L 19 35 L 37 44 L 37 22 L 22 14" strokeWidth={2} />
          <path d="M 54 14 L 57 14 L 57 35 L 39 44 L 39 22 L 54 14" strokeWidth={2} />
        </g>
      )}
    </svg>
  );
}

export function SettingsIcon({ size = 24, color = "currentColor", filled, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" {...props}>
      {filled ? (
        <path
          d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"
          fill={color}
        />
      ) : (
        <>
          <path
            d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"
            fill={color}
          />
          <path
            d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z"
            fill={color}
          />
        </>
      )}
    </svg>
  );
}

export function ShuffleIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 101 91" fill="none" {...props}>
      <path
        d="M44.15 43.95Q44.15 44.33 44.15 44.33Q41.10 48.97 38.28 53.11C33.43 60.24 27.23 59.12 18.84 58.93A0.80 0.80 0.0 0018.02 59.73L18.02 64.07Q18.02 64.87 18.83 64.90Q28.11 65.15 31.52 64.59C39.31 63.32 43.49 56.80 47.31 50.25A0.75 0.75 0.0 0148.60 50.23C52.22 56.06 55.18 61.69 62.66 64.22C65.50 65.18 69.55 64.86 73.39 64.98A0.34 0.34 0.0 0173.62 65.56L67.69 71.48Q67.08 72.09 67.69 72.70L70.60 75.61A0.79 0.79 0.0 0071.69 75.63Q76.62 71.15 79.60 68.17C83.04 64.71 84.89 61.40 81.11 57.44Q76.24 52.33 71.78 48.48A0.93 0.92 -47.1 0 070.52 48.53L67.70 51.35Q67.16 51.88 67.70 52.42L73.55 58.26A0.45 0.45 0.0 0173.26 59.02C67.28 59.38 61.94 59.32 58.25 53.92Q54.72 48.75 51.98 44.48Q51.89 44.33 51.89 43.96Q51.89 43.59 51.98 43.44Q54.73 39.17 58.26 34.00C61.96 28.61 67.30 28.55 73.28 28.92A0.45 0.45 0.0 0173.57 29.68L67.71 35.51Q67.17 36.05 67.71 36.58L70.53 39.41A0.93 0.92 47.2 0 0071.79 39.46Q76.25 35.62 81.13 30.51C84.91 26.56 83.06 23.24 79.63 19.78Q76.65 16.80 71.73 12.31A0.79 0.79 0.0 0070.64 12.33L67.72 15.23Q67.11 15.84 67.72 16.45L73.65 22.38A0.34 0.34 0.0 0173.41 22.96C69.57 23.08 65.53 22.75 62.68 23.71C55.20 26.23 52.23 31.86 48.61 37.68A0.75 0.75 0.0 0147.32 37.66C43.51 31.11 39.33 24.58 31.54 23.30Q28.14 22.74 18.85 22.98Q18.04 23.01 18.04 23.81L18.04 28.15A0.80 0.80 0.0 0018.86 28.95C27.25 28.77 33.45 27.65 38.29 34.79Q41.11 38.93 44.15 43.58Q44.15 43.58 44.15 43.95"
        fill={color}
      />
    </svg>
  );
}

export function RepeatIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" {...props}>
      <path
        d="M53.28 77.80L56.25 80.69Q58.11 82.50 56.64 85.01Q56.61 85.06 56.56 85.10Q54.01 86.91 52.29 85.20L41.59 74.58A0.76 0.76 0 0141.60 73.50L52.19 62.98Q54.12 61.06 56.27 62.84Q56.29 62.86 56.35 62.92Q58.26 64.74 56.70 66.71Q54.58 69.40 53.69 70.02Q52.25 71.01 53.99 71.03Q59.85 71.12 64.12 71.09C72.38 71.04 75.95 68.03 76.02 59.97Q76.07 55.04 76.03 42.43Q76.01 36.12 74.84 33.78Q72.48 29.05 66.24 29.05Q35.09 29.05 34.57 29.04Q28.77 29.00 26.54 30.37Q22.05 33.13 22.03 38.25Q21.99 50.46 21.99 57.33Q22.00 64.55 24.48 66.91Q27.23 71.29 34.77 71.14Q34.97 71.13 34.97 71.33L34.97 76.87Q34.97 77.28 34.56 77.27Q22.32 76.86 18.55 68.60Q16.78 64.73 16.96 55.21Q17.06 49.81 16.98 44.42Q16.86 36.94 17.81 33.69Q19.90 26.56 26.75 24.16Q30.04 23.01 38.87 23.04Q49.85 23.07 60.84 23.03Q69.43 23.00 72.57 23.95Q79.35 26.02 81.77 32.42Q83.13 36.01 83.07 46.82Q83.04 53.45 83.07 56.48Q83.14 63.13 82.31 66.04Q79.90 74.44 71.43 76.50C66.86 77.61 59.21 76.84 54.53 77.12Q53.64 77.18 53.28 77.80Z"
        fill={color}
      />
    </svg>
  );
}

export function RepeatOneIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" {...props}>
      <path
        d="M49.25 30.34L43.31 30.34Q42.68 30.34 42.68 29.71L42.68 26.77Q42.68 26.22 43.22 26.17C46.46 25.86 49.50 24.87 50.51 21.75A0.78 0.77 8.7 0 151.25 21.21L55.28 21.21A0.58 0.58 0 0155.86 21.79L55.86 50.21Q55.86 51.04 55.04 51.04L50.71 51.04A0.81 0.81 0 0149.90 50.23L49.90 30.98Q49.90 30.34 49.25 30.34Z"
        fill={color}
      />
      <path
        d="M23.00 51.04Q23.00 62.52 23.09 63.54C23.65 69.65 28.35 72.35 34.04 72.06Q34.99 72.01 34.99 72.97L34.99 77.04Q34.99 77.99 34.04 78.02C24.50 78.37 17.15 72.36 17.06 62.78Q16.98 54.60 16.99 51.04Q16.99 47.47 17.06 39.29C17.16 29.71 24.51 23.71 34.05 24.06Q35.00 24.09 35.00 25.04L35.00 29.11Q35.00 30.07 34.05 30.02C28.36 29.73 23.66 32.43 23.10 38.54Q23.01 39.56 23.00 51.04Z"
        fill={color}
      />
      <path
        d="M54.43 71.10Q53.44 71.99 54.77 72.03Q57.88 72.14 63.91 72.17Q69.77 72.19 72.44 70.78Q76.90 68.42 77.03 62.24Q77.12 57.71 77.05 43.59Q77.02 36.43 75.59 34.18Q72.68 29.57 65.35 30.09A0.32 0.31 88.3 0065.02 29.77L65.02 24.52A0.32 0.31 87.0 0065.30 24.20C75.10 23.15 82.79 29.62 82.95 39.50Q83.12 49.83 83.08 59.00C83.06 63.10 82.90 67.12 80.99 70.36Q76.68 77.71 67.54 77.97Q61.52 78.15 54.89 78.03Q53.49 78.00 54.48 78.99L58.01 82.52A1.57 1.57 0 0158.35 84.23Q57.61 86.04 57.31 86.24Q55.00 87.86 53.18 86.06L42.52 75.47A0.62 0.61 45.3 0142.52 74.60Q46.47 70.66 52.69 64.44C55.96 61.19 60.25 64.66 57.39 68.17Q56.53 69.22 54.43 71.10Z"
        fill={color}
      />
    </svg>
  );
}

export function LogoIcon({
  size = 24,
  isDarkMode = true,
  ...props
}: IconProps & { isDarkMode?: boolean }) {
  const fill = isDarkMode ? "#FFFFFF" : "#101820";
  return (
    <svg width={size} height={size} viewBox="0 0 500 500" fill="none" {...props}>
      <path
        d="M436.69 266.09L308.26 266.09L427.06 217.31L418.32 196.03L297.58 245.61L389.13 152.58L372.75 136.46L284.03 226.61L333.27 110.1L312.1 101.15L261.5 220.87L261.5 220.87L261.5 90.9L238.5 90.9L238.5 219.33L189.72 100.53L168.44 109.26L218.02 230.01L124.99 138.45L108.87 154.84L199.02 243.56L82.51 194.32L73.56 215.49L193.28 266.09L193.28 266.09L63.31 266.09L63.31 289.09L222.57 289.09L202.42 309.57L150.2 363.9L166.58 380.02L215.97 328.57L215.98 328.56L238.5 305.66L238.5 334.31L238.5 334.31L238.5 409.1L261.5 409.1L261.5 305.02L281.98 325.17L336.31 377.39L352.43 361.01L300.98 311.62L300.97 311.61L278.07 289.09L306.72 289.09L306.72 289.09L436.69 289.09L436.69 266.09"
        fill={fill}
      />
    </svg>
  );
}

// Mobile uses StackedVolumesIcon (3 stacked books) for the tafseer action in VerseActionsSheet.
export function TafseerIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <rect
        x="2"
        y="4"
        width="13"
        height="17"
        rx={1.5}
        stroke={color}
        strokeWidth={1.2}
        opacity={0.35}
      />
      <rect
        x="5"
        y="2.5"
        width="13"
        height="17"
        rx={1.5}
        stroke={color}
        strokeWidth={1.2}
        opacity={0.6}
      />
      <rect x="8" y="1" width="13" height="17" rx={1.5} stroke={color} strokeWidth={1.3} />
    </svg>
  );
}

export function MoonIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M20.5 12.5c-.67 4.44-4.64 7.5-9.11 7.5C6.48 20 2.5 16.48 2.5 11.5c0-4.47 3.06-8.44 7.5-9.11a8 8 0 0010.5 10.11z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SunIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx={12} cy={12} r={4.5} stroke={color} strokeWidth={1.5} />
      <line
        x1={12}
        y1={2.5}
        x2={12}
        y2={5}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <line
        x1={12}
        y1={19}
        x2={12}
        y2={21.5}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <line
        x1={2.5}
        y1={12}
        x2={5}
        y2={12}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <line
        x1={19}
        y1={12}
        x2={21.5}
        y2={12}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <line
        x1={5.28}
        y1={5.28}
        x2={7.05}
        y2={7.05}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <line
        x1={16.95}
        y1={16.95}
        x2={18.72}
        y2={18.72}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <line
        x1={5.28}
        y1={18.72}
        x2={7.05}
        y2={16.95}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <line
        x1={16.95}
        y1={7.05}
        x2={18.72}
        y2={5.28}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AutoThemeIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={1.5} />
      <path d="M12 3.5a8.5 8.5 0 010 17V3.5z" fill={color} opacity={0.85} />
      <circle cx={14.5} cy={10} r={1} fill="white" opacity={0.9} />
      <circle cx={16} cy={13.5} r={0.6} fill="white" opacity={0.7} />
    </svg>
  );
}

export function ShareIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <line x1={12} y1={3} x2={12} y2={15} stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      <path
        d="M8 7L12 3L16 7"
        stroke={color}
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 12V19C5 19.55 5.45 20 6 20H18C18.55 20 19 19.55 19 19V12"
        stroke={color}
        strokeWidth={1.3}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CopyIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <rect
        x={2}
        y={6}
        width={13}
        height={15}
        rx={2}
        stroke={color}
        strokeWidth={1.2}
        opacity={0.35}
      />
      <rect x={7} y={3} width={13} height={15} rx={2} stroke={color} strokeWidth={1.3} />
    </svg>
  );
}

export function HighlightIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <rect
        x="4"
        y="8"
        width="16"
        height="6"
        rx={1.5}
        stroke={color}
        strokeWidth={1.5}
        opacity={0.35}
        fill={color}
      />
      <path d="M6 8V5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <path d="M10 8V6" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <path d="M14 8V5.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <path d="M18 8V6.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <path d="M6 14V18" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <path d="M10 14V17" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <path d="M14 14V18" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <path d="M18 14V16.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

export function ChainLinksIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M9 12H15" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <rect x="3" y="8" width="8" height="8" rx={4} stroke={color} strokeWidth={1.5} />
      <rect x="13" y="8" width="8" height="8" rx={4} stroke={color} strokeWidth={1.5} />
    </svg>
  );
}

export function ProfileIcon({ size = 24, color = "currentColor", filled, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {filled ? (
        <g fill={color}>
          <path d="M4 18C4 15.7908 5.79086 14 8 14H16C18.2091 14 20 15.7908 20 18V18C20 19.1045 19.1046 20 18 20H6C4.89543 20 4 19.1045 4 18V18Z" />
          <circle cx="12" cy="6.99997" r="3" />
        </g>
      ) : (
        <g stroke={color} strokeWidth="2.5" strokeLinejoin="round" fill="none">
          <path d="M4 18C4 15.7908 5.79086 14 8 14H16C18.2091 14 20 15.7908 20 18V18C20 19.1045 19.1046 20 18 20H6C4.89543 20 4 19.1045 4 18V18Z" />
          <circle cx="12" cy="6.99997" r="3" />
        </g>
      )}
    </svg>
  );
}

export function DownloadIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M8 12L12 16M12 16L16 12M12 16V8M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function QueueIcon({ size = 24, color = "currentColor", filled, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 4.5q3.2-.03 6.3.41c1.17.16.93.95.94 2.06c.01 1.02.27 1.89-1.13 2.07q-3.1.48-6.08.51q-3.2.03-6.3-.41c-1.17-.16-.93-.95-.94-2.06c-.01-1.02-.27-1.89 1.13-2.07q3.1-.48 6.08-.51z"
        fill={filled ? color : "none"}
        stroke={color}
        strokeWidth="1.5"
      />
      <rect x="4" y="13" width="16" height="1.5" rx="0.5" fill={color} />
      <rect x="4" y="17" width="16" height="1.5" rx="0.5" fill={color} />
    </svg>
  );
}

export function TimerIcon({ size = 24, color = "currentColor", filled, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {filled ? (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM13 7C13 6.44772 12.5523 6 12 6C11.4477 6 11 6.44772 11 7V12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12V7Z"
          fill={color}
        />
      ) : (
        <>
          <path
            d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            stroke={color}
            strokeWidth="2"
          />
          <path
            d="M12 7L12 12"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      <path
        d="M21 4L20 3"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// PageQuillIcon in mobile — a page with a quill drawing on it. Used for notes / journaling surfaces.
export function NotesIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="3" y="2" width="14" height="20" rx={1.5} stroke={color} strokeWidth={1.3} />
      <line
        x1="6"
        y1="6"
        x2="14"
        y2="6"
        stroke={color}
        strokeWidth={0.8}
        strokeLinecap="round"
        opacity={0.4}
      />
      <line
        x1="6"
        y1="8.5"
        x2="14"
        y2="8.5"
        stroke={color}
        strokeWidth={0.8}
        strokeLinecap="round"
        opacity={0.4}
      />
      <line
        x1="6"
        y1="11"
        x2="12"
        y2="11"
        stroke={color}
        strokeWidth={0.8}
        strokeLinecap="round"
        opacity={0.4}
      />
      <path
        d="M21 2C21 2 18 5 16 9C15 11 14.5 13 14 15L15 15.5C16.5 13.5 18 11 19.5 8C21 5 22 3 21 2Z"
        stroke={color}
        strokeWidth={1.2}
        strokeLinejoin="round"
        fill={color}
        opacity={0.15}
      />
      <path
        d="M14 15L13 19L15 15.5"
        stroke={color}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M20 6L9 17L4 12"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Mushaf-page pill for the view-mode toggle (mobile MushafSettingsContent).
export function MushafPagePillIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <rect x="3" y="1.5" width="18" height="21" rx={1.5} stroke={color} strokeWidth={1.3} />
      <line
        x1="6"
        y1="4"
        x2="18"
        y2="4"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        opacity={0.9}
      />
      <line
        x1="7"
        y1="5.8"
        x2="17"
        y2="5.8"
        stroke={color}
        strokeWidth={0.7}
        strokeLinecap="round"
        opacity={0.45}
      />
      <line
        x1="8"
        y1="7.2"
        x2="16"
        y2="7.2"
        stroke={color}
        strokeWidth={0.7}
        strokeLinecap="round"
        opacity={0.45}
      />
      <line
        x1="6"
        y1="9"
        x2="18"
        y2="9"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        opacity={0.9}
      />
      <line
        x1="7"
        y1="10.8"
        x2="17"
        y2="10.8"
        stroke={color}
        strokeWidth={0.7}
        strokeLinecap="round"
        opacity={0.45}
      />
      <line
        x1="7.5"
        y1="12.2"
        x2="16.5"
        y2="12.2"
        stroke={color}
        strokeWidth={0.7}
        strokeLinecap="round"
        opacity={0.45}
      />
      <line
        x1="9"
        y1="13.6"
        x2="15"
        y2="13.6"
        stroke={color}
        strokeWidth={0.7}
        strokeLinecap="round"
        opacity={0.45}
      />
      <line
        x1="6"
        y1="15.4"
        x2="18"
        y2="15.4"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        opacity={0.9}
      />
      <line
        x1="7"
        y1="17.2"
        x2="17"
        y2="17.2"
        stroke={color}
        strokeWidth={0.7}
        strokeLinecap="round"
        opacity={0.45}
      />
      <line
        x1="8"
        y1="18.6"
        x2="16"
        y2="18.6"
        stroke={color}
        strokeWidth={0.7}
        strokeLinecap="round"
        opacity={0.45}
      />
      <line
        x1="9"
        y1="20"
        x2="15"
        y2="20"
        stroke={color}
        strokeWidth={0.7}
        strokeLinecap="round"
        opacity={0.45}
      />
    </svg>
  );
}

// List-view pill for the view-mode toggle (mobile MushafSettingsContent).
export function ListViewPillIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <rect
        x={10}
        y={2.5}
        width={11}
        height={3}
        rx={1.5}
        fill={color}
        opacity={0.15}
        stroke={color}
        strokeWidth={0.8}
      />
      <rect
        x={3}
        y={7.5}
        width={12}
        height={3}
        rx={1.5}
        fill={color}
        stroke={color}
        strokeWidth={0.8}
        opacity={0.5}
      />
      <rect
        x={9}
        y={12.5}
        width={12}
        height={3}
        rx={1.5}
        fill={color}
        opacity={0.15}
        stroke={color}
        strokeWidth={0.8}
      />
      <rect
        x={3}
        y={17.5}
        width={11}
        height={3}
        rx={1.5}
        fill={color}
        stroke={color}
        strokeWidth={0.8}
        opacity={0.5}
      />
    </svg>
  );
}

export function TasbihIcon({ size = 24, color = "currentColor", ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx={12} cy={2} r={1.4} fill={color} />
      <circle cx={7.5} cy={3.8} r={1.4} fill={color} />
      <circle cx={16.5} cy={3.8} r={1.4} fill={color} />
      <circle cx={5} cy={7} r={1.4} fill={color} />
      <circle cx={19} cy={7} r={1.4} fill={color} />
      <circle cx={5} cy={10.5} r={1.4} fill={color} />
      <circle cx={19} cy={10.5} r={1.4} fill={color} />
      <circle cx={7.5} cy={13.2} r={1.4} fill={color} />
      <circle cx={16.5} cy={13.2} r={1.4} fill={color} />
      <circle cx={12} cy={15} r={1.9} fill={color} />
      <line
        x1={12}
        y1={17}
        x2={12}
        y2={22}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}
