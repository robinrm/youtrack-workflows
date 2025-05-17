@echo off
:initial_Section
    ::set async mode
        setlocal EnableDelayedExpansion

    ::var
        ::UI
            set title=Clock
            set cmd_width=30
            set cmd_height=3

            set color_green=0a

    :: - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    :: var init done

    ::set UI Information
        mode con lines=%cmd_height% cols=%cmd_width%
        powershell -command "&{$H=get-host;$W=$H.ui.rawui;$B=$W.buffersize;$B.width=%cmd_width%;$B.height=9999;$W.buffersize=$B;}"
        title %title%
        color %color_green%

:start_Section
    ::WMIC to retrieve date and time
        for /F "usebackq tokens=1,2 delims==" %%i in (`wmic os get LocalDateTime /VALUE 2^>NUL`) do if '.%%i.'=='.LocalDateTime.' set ldt=%%j
        set ldt=%ldt:~0,4%.%ldt:~4,2%.%ldt:~6,2%_%ldt:~8,2%.%ldt:~10,2%.%ldt:~12,2%
        
        cls
        echo %ldt%

        timeout /T 1 /NOBREAK >nul

        goto start_Section

endlocal