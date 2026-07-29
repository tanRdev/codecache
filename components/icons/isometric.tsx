import type { ComponentPropsWithoutRef } from "react";

type IsometricIconProps = ComponentPropsWithoutRef<"svg">;

export function IsometricServer({ className, ...props }: IsometricIconProps) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g fill="none" className="nc-icon-wrapper">
        <path d="M12 11L22 6V18L12 23V11Z" fill="currentColor" fillOpacity="0.3" />
        <path d="M9 2.5L19 7.5V19.5" stroke="currentColor" />
        <path d="M2 10L12 15L22 10" stroke="currentColor" />
        <path d="M2 14L12 19L22 14" stroke="currentColor" />
        <path d="M12 11V23" stroke="currentColor" />
        <path d="M22 6L12.4472 10.7764C12.1657 10.9172 11.8343 10.9172 11.5528 10.7764L2 6" stroke="currentColor" />
        <path d="M21.4472 5.72361L12.6708 1.33541C12.2485 1.12426 11.7515 1.12426 11.3292 1.33541L2.55279 5.72361C2.214 5.893 2 6.23926 2 6.61803V17.382C2 17.7607 2.214 18.107 2.55279 18.2764L11.3292 22.6646C11.7515 22.8757 12.2485 22.8757 12.6708 22.6646L21.4472 18.2764C21.786 18.107 22 17.7607 22 17.382V6.61803C22 6.23926 21.786 5.893 21.4472 5.72361Z" stroke="currentColor" />
        <path d="M10 20H10.01" stroke="currentColor" strokeLinecap="round" />
        <path d="M10 16H10.01" stroke="currentColor" strokeLinecap="round" />
        <path d="M10 12H10.01" stroke="currentColor" strokeLinecap="round" />
        <path d="M4 9L5 9.5" stroke="currentColor" strokeLinecap="round" />
        <path d="M4 13L5 13.5" stroke="currentColor" strokeLinecap="round" />
        <path d="M4 17L5 17.5" stroke="currentColor" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export const ServerIcon = IsometricServer;

export function IsometricLaptop({ className, ...props }: IsometricIconProps) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g fill="none" className="nc-icon-wrapper">
        <path d="M18.5 5.43369V4.5L14.5 2.5V3.69098C14.5 3.88037 14.607 4.0535 14.7764 4.1382L17.9935 5.74674C18.2262 5.8631 18.5 5.69387 18.5 5.43369Z" fill="currentColor" />
        <path d="M21.3121 16.0002L22.0046 16.2549L22.0046 18.5709L12.5 23.3337L1.50001 17.8337V14.8337L12.5 20.3337L21.3121 16.0002Z" fill="currentColor" fillOpacity="0.3" />
        <path d="M11.2236 17.8882L12.5528 17.2236C12.737 17.1315 12.737 16.8685 12.5528 16.7764L9.22361 15.1118C9.08284 15.0414 8.91716 15.0414 8.77639 15.1118L7.44721 15.7764C7.26295 15.8685 7.26295 16.1315 7.44721 16.2236L10.7764 17.8882C10.9172 17.9586 11.0828 17.9586 11.2236 17.8882Z" fill="currentColor" fillOpacity="0.3" />
        <path d="M12.5 23.3251V20.5" stroke="currentColor" />
        <path d="M10.5 10.5L22 16.25" stroke="currentColor" strokeLinecap="round" />
        <path d="M21.5 16L12.9472 20.2764C12.6657 20.4172 12.3343 20.4172 12.0528 20.2764L1.5 15" stroke="currentColor" />
        <path d="M10.5 10.5V2.11803C10.5 1.37465 11.2823 0.891156 11.9472 1.22361L21.1708 5.83541C21.679 6.0895 22 6.60889 22 7.17705L22 18.132C22 18.5107 21.786 18.857 21.4472 19.0264L13.1708 23.1646C12.7485 23.3757 12.2515 23.3757 11.8292 23.1646L2.05277 18.2764C1.71398 18.107 1.49998 17.7607 1.49998 17.382V15.618C1.49998 15.2393 1.71398 14.893 2.05277 14.7236L10.5 10.5Z" stroke="currentColor" />
      </g>
    </svg>
  );
}

export const LaptopIcon = IsometricLaptop;

export function IsometricChat({ className, ...props }: IsometricIconProps) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g fill="none" className="nc-icon-wrapper">
        <path d="M17.5 22.5V10L20.5 8.5V21L17.5 22.5Z" fill="currentColor" fillOpacity="0.3" />
        <path d="M17.5 10L20.5 8.5" stroke="currentColor" />
        <path d="M3.5 3L17.5 10L17.5 22.5" stroke="currentColor" />
        <path d="M7 9.25L8.75 10.125L9.625 10.5625" stroke="currentColor" strokeLinecap="round" />
        <path d="M10.5 14.25L8.75 13.375L7 12.5" stroke="currentColor" strokeLinecap="round" />
        <path d="M14 12.75L12.25 11.875" stroke="currentColor" strokeLinecap="round" />
        <path d="M19.9472 21.2764L18.1708 22.1646C17.7485 22.3758 17.2515 22.3758 16.8292 22.1646L7 17.25L5.18045 18.9396C4.5406 19.5337 3.5 19.08 3.5 18.2068V3.61803C3.5 3.23926 3.714 2.893 4.05279 2.72361L5.82918 1.83541C6.25147 1.62426 6.74853 1.62426 7.17082 1.83541L19.9472 8.22361C20.286 8.393 20.5 8.73926 20.5 9.11803V20.382C20.5 20.7608 20.286 21.107 19.9472 21.2764Z" stroke="currentColor" />
      </g>
    </svg>
  );
}

export const ChatIcon = IsometricChat;

export function IsometricFileSearch({ className, ...props }: IsometricIconProps) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g fill="none" className="nc-icon-wrapper">
        <path d="M6.99988 6.49999L5.90502 5.96196C5.5913 5.02961 6.10316 4.02119 7.04095 3.72408L7.20785 3.6712L7.99988 3.99999L7.49988 4.99999L6.99988 6.49999Z" fill="currentColor" fillOpacity="0.3" />
        <path d="M12.5563 20.8301L9.51611 19.31L20.3798 14.1931L21.3142 14.7537C22.5205 15.3167 22.1463 16.3797 21.4391 16.7316L12.9396 21.0672L12.5563 20.8301Z" fill="currentColor" fillOpacity="0.3" />
        <path d="M20.5 14.25L21.7111 14.8556C22.4482 15.2241 22.4482 16.2759 21.7111 16.6444L11.1708 21.9146C10.7485 22.1257 10.2515 22.1257 9.82918 21.9146L2.28885 18.1444C1.55181 17.7759 1.55181 16.7241 2.28885 16.3556L3.5 15.75" stroke="currentColor" />
        <path d="M8.17713 10.4114L2.28885 13.3556C1.55181 13.7241 1.55181 14.7759 2.28885 15.1444L9.82918 18.9146C10.2515 19.1257 10.7485 19.1257 11.1708 18.9146L21.7111 13.6444C22.4482 13.2759 22.4482 12.2241 21.7111 11.8556L18.8229 10.4114" stroke="currentColor" />
        <path d="M8 7.75001L11.3292 6.08542C11.7515 5.87428 12.2485 5.87428 12.6708 6.08542L17.2466 8.37329" stroke="currentColor" />
        <path d="M20 7V9L19 10.5L17 11.625L14 12V9L17 8.5L20 7Z" fill="currentColor" fillOpacity="0.3" />
        <path d="M7 6.75004L2.71902 4.60953C2.27836 4.3892 2 3.93881 2 3.44614C2 3.01124 2.21735 2.60512 2.5792 2.36388L2.71964 2.27025C3.20219 1.94854 3.82013 1.91007 4.33887 2.16944L8.2564 4.12821" stroke="currentColor" />
        <path d="M20 6L20 8.5C20 10.433 17.0899 12 13.5 12C9.91015 12 7 10.433 7 8.5L7 6" stroke="currentColor" />
        <path d="M20 6C20 7.65685 17.0899 9 13.5 9C9.91015 9 7 7.65685 7 6C7 4.34314 9.91015 3 13.5 3C17.0899 3 20 4.34314 20 6Z" stroke="currentColor" />
        <path d="M7 13.75L11 15.75" stroke="currentColor" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export const FileSearchIcon = IsometricFileSearch;

export function IsometricFolderAdd({ className, ...props }: IsometricIconProps) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g fill="none" className="nc-icon-wrapper">
        <path d="M17.75 2.875L18.5 3.25L20 4L21.5 4.75L22.25 5.125" stroke="currentColor" strokeLinecap="round" />
        <path d="M20 1.75L20 2.5L20 4L20 5.5L20 6.25" stroke="currentColor" strokeLinecap="round" />
        <path d="M16.8944 12.4472L6 7V8.5L11 11L16 13.5V23.5L18 22.5V14.2361C18 13.4785 17.572 12.786 16.8944 12.4472Z" fill="currentColor" fillOpacity="0.3" />
        <path d="M4 13.191V10.9045C4 10.7187 4.19558 10.5978 4.3618 10.6809L8.72361 12.8618C8.893 12.9465 9 13.1196 9 13.309V15.5955C9 15.7813 8.80442 15.9022 8.6382 15.8191L4.27639 13.6382C4.107 13.5535 4 13.3804 4 13.191Z" fill="currentColor" fillOpacity="0.3" />
        <path d="M6 8.36155V2.11803C6 1.37465 6.78231 0.891156 7.44721 1.22361L14.3614 4.68071C14.7654 4.88271 15.0569 5.25602 15.1549 5.69695L15.7935 8.57073C15.9241 9.15864 16.3128 9.65638 16.8514 9.92572L19.4472 11.2236C19.786 11.393 20 11.7393 20 12.118V20.5729C20 21.1411 19.679 21.6605 19.1708 21.9146L16.6708 23.1646C16.2485 23.3757 15.7515 23.3757 15.3292 23.1646L2.82918 16.9146C2.321 16.6605 2 16.1411 2 15.5729V8.11803C2 7.37465 2.78231 6.89116 3.44721 7.22361L15.4472 13.2236C15.786 13.393 16 13.7393 16 14.118V23" stroke="currentColor" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export const FolderAddIcon = IsometricFolderAdd;

export function IsometricCloudUpload({ className, ...props }: IsometricIconProps) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g fill="none" className="nc-icon-wrapper">
        <path d="M8.65842 2.34981L6.48357 3.87636C18.2452 -0.431855 23.4453 18.7275 13.2903 22.1776L16.1728 21.2498L19.0539 19.2195L20.6846 16.9385L21.9408 14.0155L21.9408 11.0586L21.3276 8.39069L18.9815 4.7857L16.2687 2.90921L12.8692 2.00306L8.65842 2.34981Z" fill="currentColor" fillOpacity="0.3" />
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeLinecap="square" />
        <path d="M5.05852 14.8908C5.32111 13.6127 6.43639 13.1204 7.77236 13.8011C9.25529 14.5567 10.4663 16.4805 10.5411 18.162C10.5444 18.2366 10.4658 18.285 10.3993 18.2511L5.54601 15.7782C5.21096 15.6075 4.98284 15.2592 5.05852 14.8908Z" stroke="currentColor" strokeLinecap="round" />
        <path d="M4.36247 8.99627C4.39939 8.14289 5.03311 7.78174 5.77791 8.18962C6.52271 8.59751 7.09656 9.61996 7.05963 10.4733C7.02271 11.3267 6.389 11.6879 5.64419 11.28C4.89939 10.8721 4.32554 9.84965 4.36247 8.99627Z" fill="currentColor" />
        <path d="M10.0339 11.804C10.0708 10.9506 10.7045 10.5895 11.4493 10.9974C12.1941 11.4052 12.7679 12.4277 12.731 13.2811C12.6941 14.1345 12.0604 14.4956 11.3156 14.0877C10.5708 13.6798 9.99693 12.6574 10.0339 11.804Z" fill="currentColor" />
      </g>
    </svg>
  );
}

export const CloudUploadIcon = IsometricCloudUpload;

export function IsometricPlus({ className, ...props }: IsometricIconProps) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g fill="none" className="nc-icon-wrapper">
        <path d="M20.9452 13.474L18.542 14.7367V18.5655L20.9452 17.4657V13.474Z" fill="currentColor" fillOpacity="0.3" />
        <path d="M14.9113 4.30518L12.5081 5.56787V11.3966L14.9113 10.2969V4.30518Z" fill="currentColor" fillOpacity="0.3" />
        <path d="M12.4673 21.6182V15.7212L14.9518 17.0083V20.4507L12.4673 21.6182Z" fill="currentColor" fillOpacity="0.3" />
        <path d="M12.5 21.6851V15.6851L15.5 17.1851L17 17.9351" stroke="currentColor" strokeLinejoin="round" />
        <path d="M8.5 3.68506L12.5 5.68506V11.6851L18.5 14.6851V18.6851" stroke="currentColor" strokeLinejoin="round" />
        <path d="M8.5 7.18506L8.27639 7.63227L9 7.99408V7.18506H8.5ZM15 16.9336L15.2238 16.4865L14.5 16.1243V16.9336H15ZM8.5 13.6851H9C9 13.4957 8.893 13.3225 8.72361 13.2378L8.5 13.6851ZM15 10.4351H14.5V10.7411L14.7725 10.8803L15 10.4351ZM10.5623 2.61453L10.332 2.17076L10.5623 2.61453ZM14.4283 20.771L14.6425 21.2228L14.4283 20.771ZM4.05279 11.4615L3.82918 11.9087L4.05279 11.4615ZM9.05279 19.9615L9.27639 19.5142L9.05279 19.9615ZM18.0623 18.466L17.8385 18.9132L18.0623 18.466ZM18.9415 18.4738L18.7257 18.0228L18.9415 18.4738ZM14.4571 3.90603L14.6857 3.46134L14.4571 3.90603ZM11.8467 21.3584L12.0703 20.9112L11.8467 21.3584ZM13.16 21.3722L13.3742 21.824L13.16 21.3722ZM20.4549 13.2216L20.6824 12.7763L20.4549 13.2216ZM5.55709 6.14956L5.33915 5.69955L5.55709 6.14956ZM6.44016 6.15514L6.21656 6.60235L6.44016 6.15514ZM4.3462 6.73597L4.56414 7.18598L5.77502 6.59956L5.55709 6.14956L5.33915 5.69955L4.12827 6.28596L4.3462 6.73597ZM6.44016 6.15514L6.21656 6.60235L8.27639 7.63227L8.5 7.18506L8.72361 6.73784L6.66377 5.70793L6.44016 6.15514ZM8.5 7.18506H9V4.29267H8.5H8V7.18506H8.5ZM18.0623 18.466L18.2861 18.0189L15.2238 16.4865L15 16.9336L14.7762 17.3807L17.8385 18.9132L18.0623 18.466ZM11.8467 21.3584L12.0703 20.9112L9.27639 19.5142L9.05279 19.9615L8.82918 20.4087L11.6231 21.8056L11.8467 21.3584ZM8.5 19.067H9V13.6851H8.5H8V19.067H8.5ZM8.5 13.6851L8.72361 13.2378L4.27639 11.0142L4.05279 11.4615L3.82918 11.9087L8.27639 14.1323L8.5 13.6851ZM3.5 10.567H4V8.08599H3.5H3V10.567H3.5ZM13.16 21.3722L13.3742 21.824L14.6425 21.2228L14.4283 20.771L14.2142 20.3192L12.9459 20.9204L13.16 21.3722ZM15 19.8674H15.5V16.9336H15H14.5V19.8674H15ZM18.9415 18.4738L19.1573 18.9248L20.3633 18.3476L20.1475 17.8966L19.9317 17.4456L18.7257 18.0228L18.9415 18.4738ZM21 16.5436H21.5V14.1121H21H20.5V16.5436H21ZM15 10.4351H15.5V4.79542H15H14.5V10.4351H15ZM20.4549 13.2216L20.6824 12.7763L15.2275 9.98979L15 10.4351L14.7725 10.8803L20.2275 13.6668L20.4549 13.2216ZM14.4571 3.90603L14.6857 3.46134L12.1677 2.16707L11." stroke="currentColor" />
        <path d="M8.49992 6.68506V9.68506L3.70752 7.28886" stroke="currentColor" strokeLinejoin="round" />
        <path d="M18.6045 14.7455L20.8956 13.6" stroke="currentColor" />
        <path d="M12.5 11.6555L14.9936 10.4087" stroke="currentColor" />
        <path d="M12.5 5.71617L14.9936 4.46936" stroke="currentColor" />
      </g>
    </svg>
  );
}

export function IsometricCode({ className, ...props }: IsometricIconProps) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g fill="none" className="nc-icon-wrapper">
        <path d="M12 11L22 6V18L12 23V11Z" fill="currentColor" fillOpacity="0.3" />
        <path d="M9 2.5L19 7.5V19.5" stroke="currentColor" />
        <path d="M2 10L12 15L22 10" stroke="currentColor" />
        <path d="M2 14L12 19L22 14" stroke="currentColor" />
        <path d="M12 11V23" stroke="currentColor" />
        <path d="M22 6L12.4472 10.7764C12.1657 10.9172 11.8343 10.9172 11.5528 10.7764L2 6" stroke="currentColor" />
        <path d="M21.4472 5.72361L12.6708 1.33541C12.2485 1.12426 11.7515 1.12426 11.3292 1.33541L2.55279 5.72361C2.214 5.893 2 6.23926 2 6.61803V17.382C2 17.7607 2.214 18.107 2.55279 18.2764L11.3292 22.6646C11.7515 22.8757 12.2485 22.8757 12.6708 22.6646L21.4472 18.2764C21.786 18.107 22 17.7607 22 17.382V6.61803C22 6.23926 21.786 5.893 21.4472 5.72361Z" stroke="currentColor" />
        <path d="M8 10L5 12L8 14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 10L19 12L16 14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 8L10 16" stroke="currentColor" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function IsometricSettings({ className, ...props }: IsometricIconProps) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g fill="none" className="nc-icon-wrapper">
        <path d="M12 8L18 11.5V17.5L12 21L6 17.5V11.5L12 8Z" fill="currentColor" fillOpacity="0.3" />
        <path d="M12 8L18 11.5V17.5L12 21L6 17.5V11.5L12 8Z" stroke="currentColor" />
        <path d="M6 11.5L12 15L18 11.5" stroke="currentColor" />
        <path d="M12 15V21" stroke="currentColor" />
        <circle cx="12" cy="14.5" r="2.5" stroke="currentColor" />
        <path d="M12 6V8" stroke="currentColor" strokeLinecap="round" />
        <path d="M15 7L13.5 8.75" stroke="currentColor" strokeLinecap="round" />
        <path d="M9 7L10.5 8.75" stroke="currentColor" strokeLinecap="round" />
        <path d="M17 9L15.25 10.25" stroke="currentColor" strokeLinecap="round" />
        <path d="M7 9L8.75 10.25" stroke="currentColor" strokeLinecap="round" />
        <path d="M18 12.5L16 13" stroke="currentColor" strokeLinecap="round" />
        <path d="M6 12.5L8 13" stroke="currentColor" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export const SettingsIcon = IsometricSettings;
