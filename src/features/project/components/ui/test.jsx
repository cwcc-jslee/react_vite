<div className="text-zinc-800 text-sm pb-12 px-12 relative">
  <div>
    <div className="flex-col flex">
      <div className="flex">
        <div className="basis-5 text-black">
          <button className="cursor-pointer justify-center py-1 px-1.5 flex w-12 h-10">
            <label className="text-zinc-600 self-center flex">
              <i />
            </label>
          </button>
        </div>
        <div className="flex-grow text-xl text-neutral-800 font-semibold">
          <div className="border-2 border-zinc-800 border-solid rounded-sm">
            <div className="items-stretch cursor-text flex rounded-sm">
              <input
                className="text-ellipsis w-[51.00rem] h-8 p-1"
                defaultValue="프로젝트 준비"
                type="text"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="py-1 flex text-white">
        <div className="items-center flex-grow flex">
          <div className="float-left">
            <div className="flex">
              <button className="cursor-pointer w-7 h-7 rounded-sm">
                <span className="items-center justify-center flex text-neutral-800">
                  <i className="items-center justify-center flex">
                    <svg
                      className="items-center justify-center w-5 h-5"
                      fill="rgb(36, 36, 36)"
                      height="20"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM6 6a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm-2 5a2 2 0 0 0-2 2c0 1.7.83 2.97 2.13 3.8A9.14 9.14 0 0 0 9 18c.41 0 .82-.02 1.21-.06A5.5 5.5 0 0 1 9.6 17 12 12 0 0 1 9 17a8.16 8.16 0 0 1-4.33-1.05A3.36 3.36 0 0 1 3 13a1 1 0 0 1 1-1h5.6c.18-.36.4-.7.66-1H4Zm10.5 8a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0-7c.28 0 .5.22.5.5V14h1.5a.5.5 0 0 1 0 1H15v1.5a.5.5 0 0 1-1 0V15h-1.5a.5.5 0 0 1 0-1H14v-1.5c0-.28.22-.5.5-.5Z"
                        fill="rgb(36, 36, 36)"
                      />
                    </svg>
                  </i>
                </span>
              </button>
              <ul className="flex list-none text-[0.63rem] font-semibold">
                <li className="flex">
                  <div className="self-center text-center rounded-full">
                    <div>
                      <div className="bg-red-900 rounded-full">
                        <i className="inline-block"></i>
                      </div>
                    </div>
                  </div>
                </li>
                <li className="flex">
                  <div className="self-center text-center rounded-full">
                    <div>
                      <div className="bg-indigo-500 rounded-full">
                        <i className="inline-block"></i>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="items-start flex">
        <i className="pr-1"></i>
        <div className="flex-grow text-zinc-600">
          <div className="cursor-pointer flex-grow rounded">
            <div className="flex-wrap px-1 flex text-zinc-600">
              <div className="px-2">레이블 추가</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="flex-wrap flex">
      <div className="basis-[23.88rem] flex-grow relative">
        <div>
          <div className="bottom-[37.38rem] left-0 absolute right-[22.88rem] top-0">
            메모
          </div>
          <div className="text-black">
            <div
              className="py-1.5 pl-2 pr-1.5 text-indigo-800"
              contentEditable="true"
              style={{
                lineBreak: 'after-white-space',
              }}
            >
              <span>메모 추가…</span>
            </div>
          </div>
        </div>
        <div>
          <div className="flex-wrap flex">
            <div className="basis-44 flex-grow">
              <div className="relative">
                <div>
                  <label className="font-semibold text-ellipsis">시작</label>
                  <div className="items-stretch cursor-text relative flex border-2 border-neutral-400 border-solid rounded-sm">
                    <input
                      className="text-neutral-800 py-1.5 pl-2 pr-1.5 text-ellipsis w-44 h-8"
                      defaultValue="2025.03.03."
                      placeholder=""
                      type="text"
                    />
                    <i className="items-center bottom-0 cursor-pointer justify-center left-[9.00rem] absolute right-[0.25rem] top-0 flex p-1.5">
                      <svg
                        className="items-center justify-center w-5 h-5"
                        fill="rgba(0, 0, 0, 0)"
                        height="20"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M17 5.5A2.5 2.5 0 0 0 14.5 3h-9A2.5 2.5 0 0 0 3 5.5v9A2.5 2.5 0 0 0 5.5 17h4.1c-.16-.32-.3-.65-.4-1H5.5A1.5 1.5 0 0 1 4 14.5V7h12v2.2c.35.1.68.24 1 .4V5.5ZM5.5 4h9c.83 0 1.5.67 1.5 1.5V6H4v-.5C4 4.67 4.67 4 5.5 4ZM19 14.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Zm-4.02-2.64a.5.5 0 0 0-.96 0l-.47 1.53H12c-.48 0-.69.65-.3.95l1.26.94-.48 1.53c-.15.49.38.89.77.59l1.25-.95 1.25.95c.4.3.92-.1.77-.59l-.48-1.53 1.25-.94c.4-.3.2-.95-.3-.95h-1.54l-.47-1.53Z"
                          fill="rgba(0, 0, 0, 0)"
                        />
                      </svg>
                    </i>
                  </div>
                </div>
              </div>
            </div>
            <div className="basis-44 flex-grow">
              <div className="relative">
                <div>
                  <label className="text-white bg-red-600 font-semibold px-1 text-ellipsis inline-block rounded-sm">
                    마침
                  </label>
                  <div className="items-stretch cursor-text relative flex border-2 border-neutral-400 border-solid rounded-sm">
                    <input
                      className="text-neutral-800 py-1.5 pl-2 pr-1.5 text-ellipsis w-44 h-8"
                      defaultValue="2025.03.07."
                      placeholder=""
                      type="text"
                    />
                    <i className="items-center bottom-0 cursor-pointer justify-center absolute right-0 top-0 flex p-1.5">
                      <svg
                        className="items-center justify-center w-5 h-5"
                        fill="rgba(0, 0, 0, 0)"
                        height="20"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm1 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm2-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm1 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm2-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm4-5.5A2.5 2.5 0 0 0 14.5 3h-9A2.5 2.5 0 0 0 3 5.5v9A2.5 2.5 0 0 0 5.5 17h9a2.5 2.5 0 0 0 2.5-2.5v-9ZM4 7h12v7.5c0 .83-.67 1.5-1.5 1.5h-9A1.5 1.5 0 0 1 4 14.5V7Zm1.5-3h9c.83 0 1.5.67 1.5 1.5V6H4v-.5C4 4.67 4.67 4 5.5 4Z"
                          fill="rgba(0, 0, 0, 0)"
                        />
                      </svg>
                    </i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-wrap pt-2 flex">
            <div className="basis-44 flex-col flex-grow flex">
              <label className="font-semibold text-ellipsis">기간</label>
              <div className="flex border-2 border-neutral-400 border-solid rounded-sm">
                <div className="py-1.5 px-2 relative flex">
                  <div className="flex">
                    <input
                      className="cursor-text w-6 h-5"
                      defaultValue="5일"
                      type="text"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="basis-44 flex-grow">
              <div>
                <div className="items-center font-semibold">
                  <label className="text-ellipsis">% 완료</label>
                </div>
                <div className="flex border-2 border-neutral-400 border-solid rounded-sm">
                  <input
                    className="rounded-bl-sm rounded-tl-sm cursor-text flex-grow py-1.5 pl-2 pr-1.5 text-ellipsis w-40 h-8"
                    defaultValue="0"
                    type="text"
                  />
                  <span className="text-[0.50rem] text-zinc-600">
                    <button className="rounded-tr-sm text-center w-6 h-3.5">
                      <span className="items-center justify-center flex">
                        <i></i>
                      </span>
                    </button>
                    <button className="rounded-br-sm text-center w-6 h-3.5">
                      <span className="items-center justify-center flex">
                        <i></i>
                      </span>
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-wrap pt-2 flex">
          <div className="basis-44 flex-grow">
            <div className="flex-col flex">
              <label className="font-semibold text-ellipsis">버킷</label>
              <div className="text-neutral-800 relative">
                <span className="text-zinc-800 cursor-pointer pl-2 pr-8 text-ellipsis border-2 border-neutral-400 border-solid rounded-sm">
                  기획 단계
                </span>
                <span className="bottom-0 cursor-pointer left-[10.25rem] pt-1 absolute right-[0.50rem] top-0 text-xs text-zinc-800">
                  <i className="inline-block"></i>
                </span>
              </div>
            </div>
          </div>
          <div className="basis-44 flex-grow">
            <div className="flex-col flex">
              <label className="font-semibold text-ellipsis">우선 순위</label>
              <div className="text-neutral-800 relative">
                <span className="text-zinc-800 cursor-pointer pl-2 pr-8 text-ellipsis border-2 border-neutral-400 border-solid rounded-sm">
                  <div className="items-center flex">
                    <i className="text-green-900 items-center justify-center flex">
                      <svg
                        className="items-center justify-center w-5 h-5"
                        fill="rgb(11, 106, 11)"
                        height="20"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          fill="rgb(11, 106, 11)"
                        />
                      </svg>
                    </i>
                    중간
                  </div>
                </span>
                <span className="bottom-0 cursor-pointer left-[10.25rem] pt-1 absolute right-[0.50rem] top-0 text-xs text-zinc-800">
                  <i className="inline-block"></i>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-wrap pt-2 flex">
          <div className="basis-44 flex-col flex-grow flex">
            <label className="font-semibold text-ellipsis">스프린트</label>
            <div className="text-neutral-800 relative">
              <span className="text-zinc-800 cursor-pointer pl-2 pr-8 text-ellipsis border-2 border-neutral-400 border-solid rounded-sm">
                백로그
              </span>
              <span className="bottom-0 cursor-pointer left-[10.25rem] pt-1 absolute right-[0.50rem] top-0 text-xs text-zinc-800">
                <i className="inline-block"></i>
              </span>
            </div>
          </div>
        </div>
        <div>
          <button className="text-black items-center cursor-pointer font-semibold pb-1 pr-1.5 text-center flex w-96 h-5">
            <i className="justify-center flex">
              <svg
                className="items-center justify-center w-5 h-5"
                fill="rgb(0, 0, 0)"
                height="20"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.85 7.65c.2.2.2.5 0 .7l-5.46 5.49a.55.55 0 0 1-.78 0L4.15 8.35a.5.5 0 1 1 .7-.7L10 12.8l5.15-5.16c.2-.2.5-.2.7 0Z"
                  fill="rgb(0, 0, 0)"
                />
              </svg>
            </i>
            체크리스트 0/1
          </button>
          <div className="flex-col pt-4 flex gap-1">
            <ul className="flex-col flex list-none text-zinc-600">
              <li className="list-item">
                <div className="items-center cursor-pointer flex">
                  <div className="items-center flex-grow pl-1.5 flex">
                    <div className="flex">
                      <label className="items-start flex" />
                    </div>
                    <div
                      className="items-center justify-between pr-1 flex text-zinc-800"
                      style={{
                        flexGrow: '2',
                      }}
                    >
                      <div
                        className="text-ellipsis"
                        style={{
                          flexGrow: '2',
                        }}
                      >
                        <div className="items-stretch cursor-text flex rounded-sm text-neutral-800">
                          <input
                            className="pl-1.5 pr-2 w-80 h-7"
                            defaultValue="체크리스트 추가"
                            type="text"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
            <div className="items-center flex">
              <div className="flex">
                <label className="items-start flex" />
              </div>
              <div className="flex-grow text-neutral-800">
                <div className="items-stretch cursor-text flex rounded-sm">
                  <input
                    className="pl-1.5 pr-2 text-ellipsis w-96 h-7"
                    defaultValue=""
                    placeholder="항목 추가"
                    type="text"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <button className="text-black items-center cursor-pointer font-semibold pb-1 pr-1.5 text-center flex w-96 h-5">
            <i className="justify-center flex">
              <svg
                className="items-center justify-center w-5 h-5"
                fill="rgb(0, 0, 0)"
                height="20"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.85 7.65c.2.2.2.5 0 .7l-5.46 5.49a.55.55 0 0 1-.78 0L4.15 8.35a.5.5 0 1 1 .7-.7L10 12.8l5.15-5.16c.2-.2.5-.2.7 0Z"
                  fill="rgb(0, 0, 0)"
                />
              </svg>
            </i>
            작업
          </button>
          <div className="flex-wrap text-[1.38rem] leading-7 flex">
            <div className="basis-[6.25rem] flex-grow px-1 flex text-sm">
              <div>
                <label>완료됨</label>
                <div className="flex border-2 border-neutral-400 border-solid rounded-sm">
                  <div className="py-1.5 px-2 relative flex">
                    <div className="flex">
                      <input
                        className="cursor-text w-10 h-5"
                        defaultValue="0시간"
                        type="text"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-grow px-1 pt-7">+</div>
            <div className="basis-[6.25rem] flex-grow px-1 flex text-sm">
              <div>
                <label>남음</label>
                <div className="flex border-2 border-neutral-400 border-solid rounded-sm">
                  <div className="py-1.5 px-2 relative flex">
                    <div className="flex">
                      <input
                        className="cursor-text w-12 h-5"
                        defaultValue="80시간"
                        type="text"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-grow px-1 pt-7">=</div>
          </div>
        </div>
        <div className="bg-gray-200 bottom-0 left-[26.50rem] absolute right-[-2.00rem] top-0" />
      </div>
    </div>
  </div>
</div>;
