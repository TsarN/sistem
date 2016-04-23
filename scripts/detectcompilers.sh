#!/bin/bash
echo '['

# GNU Compiler Collection (C)
if which gcc > /dev/null 2>&1; then
    gccver=`gcc --version | sed -n 's/^g.*) //p' | head -1`
echo '{"type": "c", "name":"GCC '$gccver' (C99)", "version":"'$gccver'", "path":"'`which gcc`'",
"buildcmd":"%cmd% -Wall --std=c99 -O2 %src% -o %exe%", "runcmd":"%exe%"},'
echo '{"type": "c", "name":"GCC '$gccver' (C11)", "version":"'$gccver'", "path":"'`which gcc`'",
"buildcmd":"%cmd% -Wall --std=c99 -O2 %src% -o %exe%", "runcmd":"%exe%"},'
fi

# GNU Compiler Collection (C++)
if which g++ > /dev/null 2>&1; then
    gxxver=`g++ --version | sed -n 's/^g.*) //p' | head -1`
echo '{"type": "cpp", "name":"G++ '$gxxver' (C++99)", "version":"'$gxxver'", "path":"'`which g++`'",
"buildcmd":"%cmd% -Wall --std=c++99 -O2 %src% -o %exe%", "runcmd":"%exe%"},'
echo '{"type": "cpp", "name":"G++ '$gxxver' (C++11)", "version":"'$gxxver'", "path":"'`which g++`'",
"buildcmd":"%cmd% -Wall --std=c++11 -O2 %src% -o %exe%", "runcmd":"%exe%"},'
fi

# LLVM CLang (C)
if which clang > /dev/null 2>&1; then
    clangver=`clang --version | sed -n 's/^clang version \(.*\) (.*)$/\1/p'`
echo '{"type": "c", "name":"CLang '$clangver' (C99)", "version":"'$clangver'", "path": "'`which clang`'",
"buildcmd":"%cmd% -Wall -std=c99 -O2 %src% -o %exe%","runcmd":"%exe%"},'
echo '{"type": "c", "name":"CLang '$clangver' (C11)", "version":"'$clangver'", "path": "'`which clang`'",
"buildcmd":"%cmd% -Wall -std=c11 -O2 %src% -o %exe%","runcmd":"%exe%"},'
fi

# LLVM CLang (C++)
if which clang++ > /dev/null 2>&1; then
    clangxxver=`clang++ --version | sed -n 's/^clang version \(.*\) (.*)$/\1/p'`
echo '{"type": "cpp", "name":"CLang '$clangxxver' (C++99)", "version":"'$clangxxver'", "path": "'`which clang++`'",
"buildcmd":"%cmd% -Wall -std=c++99 -O2 %src% -o %exe%","runcmd":"%exe%"},'
echo '{"type": "cpp", "name":"CLang '$clangxxver' (C++11)", "version":"'$clangxxver'", "path": "'`which clang++`'",
"buildcmd":"%cmd% -Wall -std=c++11 -O2 %src% -o %exe%","runcmd":"%exe%"},'
fi

# Python 2
if which python2 > /dev/null 2>&1; then
    python2ver=`python2 --version 2>&1 | sed -n 's/^Python //p'`
echo '{"type": "py", "name":"Python '$python2ver'", "version":"'$python2ver'", "path": "'`which python2`'",
"buildcmd":"","runcmd":"%cmd% %exe%"},'
fi

# Python 3
if which python3 > /dev/null 2>&1; then
    python3ver=`python3 --version 2>&1 | sed -n 's/^Python //p'`
echo '{"type": "py", "name":"Python '$python3ver'", "version":"'$python3ver'", "path": "'`which python3`'",
"buildcmd":"","runcmd":"%cmd% %exe%"},'
fi

# Free Pascal Compiler
if which fpc > /dev/null 2>&1; then
    fpcver=`fpc -iV`
echo '{"type": "pas", "name":"Free Pascal '$fpcver'", "version":"'$fpcver'", "path": "'`which fpc`'",
"buildcmd":"fpc -Mdelphi -FE/tmp/.sistem_fpc %src% && rm /tmp/.sistem_fpc/*.o && mv /tmp/.sistem_fpc/* %exe% && rm /tmp/.sistem_fpc/*", "runcmd": "%exe%"},'
fi

# Java 
if which javac > /dev/null 2>&1; then
    javaver=`javac -version 2>&1 | sed -n 's/^javac //p'`
echo '{"type": "java", "name":"Java '$javaver'", "version":"'$javaver'", "path": "'`which javac`'"},'
fi

# Perl
if which perl > /dev/null 2>&1; then
    perlver=`perl --version | sed -n 's/^.*(v\([0-9.]*\)).*$/\1/p'`
echo '{"type": "perl", "name":"Perl '$perlver'", "version":"'$perlver'", "path": "'`which perl`'",
"buildcmd":"","runcmd":"%cmd% %exe%"},'
fi

echo 'null'
echo ']'
