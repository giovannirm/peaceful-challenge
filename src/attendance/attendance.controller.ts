import { Controller, Post, Get, Body, Param, ParseIntPipe } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @Post('check-in')
    checkIn(@Body() createAttendanceDto: CreateAttendanceDto) {
        return this.attendanceService.checkIn(createAttendanceDto);
    }

    @Post('check-out')
    checkOut(@Body() createAttendanceDto: CreateAttendanceDto) {
        return this.attendanceService.checkOut(createAttendanceDto);
    }

    @Get('employee/:id')
    getAttendances(@Param('id', ParseIntPipe) employeeId: number) {
        return this.attendanceService.getAttendances(employeeId);
    }
}
